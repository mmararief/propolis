# Data Flow Diagram (DFD)

## DFD Level 0 - Context Diagram

```mermaid
flowchart TD
    A[Pelanggan] -->|Request Data| B[Sistem E-Commerce]
    B -->|Response Data| A
    
    C[Admin] -->|Manage Data| B
    B -->|Response Data| C
    
    D[RajaOngkir API] -->|Shipping Data| B
    B -->|Shipping Request| D
    
    E[Storage] -->|File Storage| B
    B -->|File Operations| E
```

## DFD Level 1 - Sistem Utama

```mermaid
flowchart TD
    Start([User Access]) --> Auth{Authenticated?}
    
    Auth -->|No| Reg[1.0 Register/Login]
    Reg --> Auth
    
    Auth -->|Yes| MainMenu{User Type?}
    
    MainMenu -->|Pelanggan| CustomerFlow[2.0 Customer Flow]
    MainMenu -->|Admin| AdminFlow[3.0 Admin Flow]
    
    CustomerFlow --> Browse[2.1 Browse Products]
    CustomerFlow --> Cart[2.2 Manage Cart]
    CustomerFlow --> Checkout[2.3 Checkout]
    CustomerFlow --> Payment[2.4 Payment]
    CustomerFlow --> Track[2.5 Track Orders]
    
    AdminFlow --> ManageProducts[3.1 Manage Products]
    AdminFlow --> ManageOrders[3.2 Manage Orders]
    AdminFlow --> ManageUsers[3.3 Manage Users]
    AdminFlow --> Reports[3.4 Generate Reports]
    
    Browse --> ProductsDB[(Products DB)]
    Cart --> CartDB[(Cart DB)]
    Checkout --> OrdersDB[(Orders DB)]
    Payment --> OrdersDB
    Track --> OrdersDB
    
    ManageProducts --> ProductsDB
    ManageOrders --> OrdersDB
    ManageUsers --> UsersDB[(Users DB)]
    Reports --> OrdersDB
    Reports --> ProductsDB
```

## DFD Level 2 - Customer Flow Detail

```mermaid
flowchart TD
    Start([Customer Access]) --> Browse[2.1 Browse Products]
    
    Browse --> ViewProduct[2.1.1 View Product Detail]
    ViewProduct --> AddToCart[2.1.2 Add to Cart]
    
    AddToCart --> CartPage[2.2 Cart Management]
    CartPage --> UpdateQty[2.2.1 Update Quantity]
    CartPage --> RemoveItem[2.2.2 Remove Item]
    CartPage --> CheckoutBtn[2.2.3 Proceed to Checkout]
    
    CheckoutBtn --> CheckoutForm[2.3 Checkout Process]
    CheckoutForm --> SelectAddress[2.3.1 Select/Add Address]
    CheckoutForm --> SelectShipping[2.3.2 Select Shipping]
    SelectShipping --> CalcShipping[2.3.3 Calculate Shipping Cost]
    CalcShipping --> RajaOngkir[RajaOngkir API]
    RajaOngkir --> CalcShipping
    CalcShipping --> ReviewOrder[2.3.4 Review Order]
    ReviewOrder --> CreateOrder[2.3.5 Create Order]
    
    CreateOrder --> ReserveStock[2.3.6 Reserve Stock]
    ReserveStock --> ProductsDB[(Products DB)]
    CreateOrder --> OrdersDB[(Orders DB)]
    
    CreateOrder --> PaymentPage[2.4 Payment]
    PaymentPage --> UploadProof[2.4.1 Upload Payment Proof]
    UploadProof --> Storage[(File Storage)]
    UploadProof --> OrdersDB
    
    PaymentPage --> TrackOrder[2.5 Track Orders]
    TrackOrder --> ViewOrderDetail[2.5.1 View Order Detail]
    TrackOrder --> ConfirmDelivery[2.5.2 Confirm Delivery]
    ConfirmDelivery --> OrdersDB
    
    ProductsDB --> Browse
    CartDB[(Cart DB)] --> CartPage
    CartPage --> CartDB
    OrdersDB --> TrackOrder
```

## DFD Level 2 - Admin Flow Detail

```mermaid
flowchart TD
    Start([Admin Access]) --> Dashboard[3.0 Admin Dashboard]
    
    Dashboard --> ManageProducts[3.1 Product Management]
    Dashboard --> ManageOrders[3.2 Order Management]
    Dashboard --> ManageUsers[3.3 User Management]
    Dashboard --> Reports[3.4 Reports]
    
    ManageProducts --> CreateProduct[3.1.1 Create Product]
    ManageProducts --> UpdateProduct[3.1.2 Update Product]
    ManageProducts --> DeleteProduct[3.1.3 Delete Product]
    ManageProducts --> ManageCategories[3.1.4 Manage Categories]
    ManageProducts --> ManagePriceTiers[3.1.5 Manage Price Tiers]
    
    CreateProduct --> ProductsDB[(Products DB)]
    UpdateProduct --> ProductsDB
    DeleteProduct --> ProductsDB
    ManageCategories --> CategoriesDB[(Categories DB)]
    ManagePriceTiers --> PriceTiersDB[(Price Tiers DB)]
    
    ManageOrders --> ViewOrders[3.2.1 View Orders]
    ManageOrders --> CreateManualOrder[3.2.2 Create Manual Order]
    ManageOrders --> VerifyPayment[3.2.3 Verify Payment]
    ManageOrders --> InputProductCodes[3.2.4 Input Product Codes]
    ManageOrders --> ShipOrder[3.2.5 Ship Order]
    ManageOrders --> MarkDelivered[3.2.6 Mark as Delivered]
    ManageOrders --> ReleaseReservation[3.2.7 Release Expired Reservations]
    
    ViewOrders --> OrdersDB
    CreateManualOrder --> OrdersDB
    CreateManualOrder --> ReserveStock[Reserve Stock]
    ReserveStock --> ProductsDB
    VerifyPayment --> OrdersDB
    VerifyPayment --> Storage[(File Storage)]
    InputProductCodes --> ProductCodesDB[(Product Codes DB)]
    ShipOrder --> OrdersDB
    MarkDelivered --> OrdersDB
    ReleaseReservation --> OrdersDB
    ReleaseReservation --> ProductsDB
    
    ManageUsers --> ListUsers[3.3.1 List Users]
    ManageUsers --> CreateUser[3.3.2 Create User]
    ManageUsers --> UpdateUser[3.3.3 Update User]
    ManageUsers --> DeleteUser[3.3.4 Delete User]
    
    ListUsers --> UsersDB[(Users DB)]
    CreateUser --> UsersDB
    UpdateUser --> UsersDB
    DeleteUser --> UsersDB
    
    Reports --> SummaryReport[3.4.1 Summary Report]
    Reports --> SalesTrend[3.4.2 Sales Trend]
    Reports --> ProductSales[3.4.3 Product Sales]
    Reports --> ChannelPerformance[3.4.4 Channel Performance]
    Reports --> ExportReport[3.4.5 Export Report]
    
    SummaryReport --> OrdersDB
    SalesTrend --> OrdersDB
    ProductSales --> OrdersDB
    ProductSales --> ProductsDB
    ChannelPerformance --> OrdersDB
    ExportReport --> OrdersDB
    ExportReport --> ProductsDB
```

## DFD Level 3 - Order Processing Detail

```mermaid
flowchart TD
    Start([Order Created]) --> CheckStatus{Order Status}
    
    CheckStatus -->|belum_dibayar| WaitPayment[Wait for Payment]
    CheckStatus -->|menunggu_konfirmasi| WaitVerify[Wait for Admin Verification]
    CheckStatus -->|diproses| ProcessOrder[Process Order]
    CheckStatus -->|dikirim| ShipOrder[Ship Order]
    CheckStatus -->|selesai| Complete[Order Complete]
    CheckStatus -->|dibatalkan| Cancel[Cancel Order]
    CheckStatus -->|expired| Expire[Expire Order]
    
    WaitPayment --> CheckExpiry{Reservation Expired?}
    CheckExpiry -->|Yes| Expire
    CheckExpiry -->|No| UploadProof[Upload Payment Proof]
    UploadProof --> WaitVerify
    
    WaitVerify --> AdminVerify{Admin Verify}
    AdminVerify -->|Approved| ProcessOrder
    AdminVerify -->|Rejected| WaitPayment
    
    ProcessOrder --> CheckStock{Stock Available?}
    CheckStock -->|No| InsufficientStock[Insufficient Stock]
    CheckStock -->|Yes| AllocateStock[Allocate Stock]
    
    AllocateStock --> ProductsDB[(Products DB)]
    AllocateStock --> InputCodes[Input Product Codes]
    InputCodes --> ProductCodesDB[(Product Codes DB)]
    InputCodes --> ValidateCodes{All Codes Valid?}
    ValidateCodes -->|No| InputCodes
    ValidateCodes -->|Yes| ShipOrder
    
    ShipOrder --> UpdateTracking[Update Tracking Info]
    UpdateTracking --> OrdersDB[(Orders DB)]
    UpdateTracking --> WaitDelivery[Wait for Delivery]
    
    WaitDelivery --> CustomerConfirm{Customer Confirm?}
    CustomerConfirm -->|Yes| Complete
    CustomerConfirm -->|No| WaitDelivery
    
    Expire --> ReleaseStock[Release Reserved Stock]
    ReleaseStock --> ProductsDB
    Cancel --> ReleaseStock
    
    Complete --> OrdersDB
    Expire --> OrdersDB
    Cancel --> OrdersDB
```

## DFD Level 3 - Stock Management Detail

```mermaid
flowchart TD
    Start([Stock Operation]) --> OperationType{Operation Type?}
    
    OperationType -->|Reserve| ReserveStock[Reserve Stock]
    OperationType -->|Allocate| AllocateStock[Allocate Stock]
    OperationType -->|Release| ReleaseStock[Release Stock]
    OperationType -->|Update| UpdateStock[Update Stock]
    
    ReserveStock --> CheckAvailable{Stock Available?}
    CheckAvailable -->|No| Error[Error: Insufficient Stock]
    CheckAvailable -->|Yes| DecrementAvailable[Decrement stok_available]
    DecrementAvailable --> IncrementReserved[Increment stok_reserved]
    IncrementReserved --> ProductsDB[(Products DB)]
    
    AllocateStock --> ValidateQty{Quantity Valid?}
    ValidateQty -->|No| Error
    ValidateQty -->|Yes| DecrementStock[Decrement stok]
    DecrementStock --> DecrementReserved[Decrement stok_reserved]
    DecrementReserved --> ProductsDB
    
    ReleaseStock --> IncrementAvailable[Increment stok_available]
    IncrementAvailable --> DecrementReserved2[Decrement stok_reserved]
    DecrementReserved2 --> ProductsDB
    
    UpdateStock --> ValidateNewQty{New Qty Valid?}
    ValidateNewQty -->|No| Error
    ValidateNewQty -->|Yes| UpdateProductsDB[Update Products DB]
    UpdateProductsDB --> ProductsDB
    
    ProductsDB --> End([Operation Complete])
    Error --> End
```

## Data Stores (Database Tables)

1. **Users DB**: `users` table
2. **Products DB**: `products` table
3. **Categories DB**: `kategori` table
4. **Cart DB**: `keranjang` table
5. **Orders DB**: `orders` table
6. **Order Items DB**: `order_items` table
7. **Product Codes DB**: `order_item_product_codes` table
8. **Price Tiers DB**: `harga_tingkat` table
9. **Addresses DB**: `addresses` table
10. **Storage**: File storage for images and payment proofs

## External Entities

1. **Pelanggan**: End user yang melakukan pembelian
2. **Admin**: Administrator sistem
3. **RajaOngkir API**: External API untuk shipping calculation
4. **Storage**: File storage system

