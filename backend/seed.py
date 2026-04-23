from database import init_db, SessionLocal, User, Product, Warehouse, Inventory, Supplier

def seed_data():
    db = SessionLocal()
    
    # 1. Create Admin User
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        admin_user = User(
            username="admin",
            email="admin@stockflow.com",
            hashed_password="admin123",
            role="Admin"
        )
        db.add(admin_user)

    # 2. Create Warehouse
    wh_main = db.query(Warehouse).filter(Warehouse.name == "Main Warehouse").first()
    if not wh_main:
        wh_main = Warehouse(name="Main Warehouse", location="Zone A, Floor 1")
        db.add(wh_main)
        db.commit()
        db.refresh(wh_main)

    # 3. Create Supplier
    supplier = db.query(Supplier).filter(Supplier.name == "Global Electronics").first()
    if not supplier:
        supplier = Supplier(name="Global Electronics", contact_name="John Doe", email="contact@globalelec.com")
        db.add(supplier)

    # 4. Create Products
    products_data = [
        ("Wireless Headset Pro XL", "WHP-2025-XL", "Electronics", 129.99, 85, 20),
        ("Ergonomic Office Chair", "CHR-ERG-01", "Furniture", 249.50, 12, 15),
        ("Mechanical Keyboard RGB", "KBD-RGB-MAX", "Accessories", 89.00, 45, 10),
        ("Ultra-Wide Monitor 34\"", "MON-UW-34", "Electronics", 499.99, 8, 5),
        ("Standing Desk Frame", "DSK-STN-BLK", "Furniture", 320.00, 22, 10),
    ]

    for name, sku, cat, price, qty, reorder in products_data:
        product = db.query(Product).filter(Product.sku == sku).first()
        if not product:
            product = Product(
                name=name, sku=sku, category=cat, price=price, 
                reorder_point=reorder, reorder_qty=reorder*2
            )
            db.add(product)
            db.commit()
            db.refresh(product)
            
            inv = Inventory(product_id=product.id, warehouse_id=wh_main.id, quantity=qty)
            db.add(inv)

    db.commit()
    db.close()
    print("Enterprise seed data completed!")

if __name__ == "__main__":
    init_db()
    seed_data()
