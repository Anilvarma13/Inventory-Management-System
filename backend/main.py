from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
import database as db_mod
import os

app = FastAPI(title="StockFlow Pro API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = db_mod.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def log_action(db: Session, action: str, target_type: str, target_id: int, summary: str):
    log = db_mod.AuditLog(
        user_id=1,
        action=action,
        target_type=target_type,
        target_id=target_id,
        change_summary=summary
    )
    db.add(log)
    db.commit()

@app.post("/api/login")
def login(data: dict, db: Session = Depends(get_db)):
    username = data.get("username")
    password = data.get("password")
    user = db.query(db_mod.User).filter(db_mod.User.username == username).first()
    if not user or user.hashed_password != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"id": user.id, "username": user.username, "role": user.role, "token": "simulated_jwt_token_123"}

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(db_mod.Product).count()
    low_stock = db.query(db_mod.Inventory).filter(db_mod.Inventory.quantity <= 20).count()
    inventory_value = db.query(func.sum(db_mod.Inventory.quantity * db_mod.Product.price)).join(db_mod.Product).scalar() or 0.0
    
    category_data = db.query(db_mod.Product.category, func.count(db_mod.Product.id)).group_by(db_mod.Product.category).all()
    categories = [{"name": c[0], "value": c[1]} for c in category_data]

    # Analytics
    best_prods = db.query(db_mod.Product.name, (db_mod.Inventory.quantity * db_mod.Product.price).label("v")).join(db_mod.Inventory).order_by(desc("v")).limit(5).all()
    worst_prods = db.query(db_mod.Product.name, db_mod.Inventory.quantity).join(db_mod.Inventory).order_by(db_mod.Inventory.quantity).limit(5).all()
    
    best_sellers = db.query(db_mod.Product.name, func.sum(db_mod.AuditLog.target_id)).join(db_mod.AuditLog, db_mod.AuditLog.target_id == db_mod.Product.id).filter(db_mod.AuditLog.action == "ADJUST").group_by(db_mod.Product.name).limit(5).all()

    inventory_trend = [
        {"month": "Jan", "value": inventory_value * 0.75},
        {"month": "Feb", "value": inventory_value * 0.82},
        {"month": "Mar", "value": inventory_value * 0.9},
        {"month": "Apr", "value": inventory_value * 0.88},
        {"month": "May", "value": inventory_value * 0.95},
        {"month": "Jun", "value": inventory_value},
    ]

    return {
        "totalProducts": total_products,
        "pendingOrders": 8,
        "lowStockAlerts": low_stock,
        "inventoryValue": inventory_value,
        "categoryDistribution": categories,
        "bestProducts": [{"name": p[0], "value": p[1]} for p in best_prods],
        "worstProducts": [{"name": p[0], "value": p[1]} for p in worst_prods],
        "bestSellers": [{"name": p[0], "value": abs(p[1])} for p in best_sellers] if best_sellers else [{"name": "Sample Item", "value": 100}],
        "inventoryTrend": inventory_trend
    }

@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(db_mod.Product).all()
    result = []
    for p in products:
        inv = db.query(db_mod.Inventory).filter(db_mod.Inventory.product_id == p.id).first()
        quantity = inv.quantity if inv else 0
        result.append({
            "id": p.id, "name": p.name, "sku": p.sku, "category": p.category,
            "quantity": quantity, "price": p.price, "reorderPoint": p.reorder_point,
            "status": "In Stock" if quantity > p.reorder_point else "Low Stock" if quantity > 0 else "Out of Stock"
        })
    return result

@app.post("/api/inventory/adjust")
def adjust_inventory(data: dict, db: Session = Depends(get_db)):
    prod_id = data.get("productId")
    adj_qty = int(data.get("adjustment"))
    inv = db.query(db_mod.Inventory).filter(db_mod.Inventory.product_id == prod_id).first()
    if inv:
        inv.quantity += adj_qty
        db.commit()
        log_action(db, "ADJUST", "INVENTORY", inv.id, f"Stock changed by {adj_qty}")
        return {"status": "success"}
    return {"status": "error"}

@app.get("/api/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(db_mod.AuditLog).order_by(db_mod.AuditLog.timestamp.desc()).limit(20).all()

# Serve Frontend build
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
