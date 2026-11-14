# Activity Diagrams and Workflow Models: BUP Nest

This document presents the detailed process workflows and activity diagrams for BUP Nest's critical operations.

---

## 1. End-to-End Order Placement & Concurrency Activity Flow

```mermaid
flowchart TD
    Start([Buyer Starts Checkout]) --> LoadCart[Load Cart Items & Calculate Subtotal]
    LoadCart --> CheckVerify{Is Buyer BUP Verified?}
    CheckVerify -- Yes --> ApplyDiscount[Deduct 5% Verified Student Discount]
    CheckVerify -- No --> StandardPrice[Apply Standard Price]
    ApplyDiscount --> AddDelivery[Add BDT 60 Campus Delivery Fee]
    StandardPrice --> AddDelivery

    AddDelivery --> FormFill[Select Campus Drop-Off Zone & Phone Number]
    FormFill --> PaySelect{Payment Method?}
    PaySelect -- "bKash / Nagad" --> EnterTrx[Input Mobile Transaction ID 'paymentTrxId']
    PaySelect -- "Cash on Delivery" --> SubmitOrder[Submit Order Form]
    EnterTrx --> SubmitOrder

    SubmitOrder --> ServerAction[Execute Server Action: createOrderAction]
    ServerAction --> DBTx[Begin SQLite Transaction: BEGIN]

    DBTx --> StockCheck{For all items: stock >= quantity?}
    StockCheck -- No --> RollbackStock[Rollback Transaction: Insufficient Stock]
    RollbackStock --> UserFail([Return Error: Product Sold Out])

    StockCheck -- Yes --> TrxCheck{Is paymentTrxId unique in orders?}
    TrxCheck -- No --> RollbackTrx[Rollback Transaction: Duplicate TrxID]
    RollbackTrx --> UserFail2([Return Error: Duplicate TrxID Reused])

    TrxCheck -- Yes --> DecrStock[Deduct Stock for each Product: stock = stock - qty]
    DecrStock --> InsertOrder[Insert Record into 'orders' Table]
    InsertOrder --> InsertItems[Insert Items into 'order_items' Table]
    InsertItems --> CommitTx[Commit SQLite Transaction: COMMIT]

    CommitTx --> ClearCart[Clear LocalStorage Cart via Context]
    ClearCart --> Redirect[Redirect Buyer to /orders/id with Digital Receipt]
    Redirect --> End([Order Placed Successfully])
```

---

## 2. Order Cancellation & Stock Restoration Activity Flow

```mermaid
flowchart TD
    StartCancel([Buyer Clicks Cancel Order]) --> VerifyAuth[Check Buyer Session & Ownership]
    VerifyAuth --> CheckState{Is Order Status 'PENDING'?}
    CheckState -- No --> RejectCancel([Reject: Order Already In Preparation or Shipped])
    CheckState -- Yes --> StartTx[Begin SQLite Transaction: BEGIN]

    StartTx --> UpdateStatus["Update 'orders' SET status = 'CANCELLED'"]
    UpdateStatus --> FetchItems[Fetch Line Items from 'order_items']
    FetchItems --> LoopItems[For Each Item in Order]
    LoopItems --> RestoreStock["UPDATE 'products' SET stock = stock + qty, in_stock = 1 WHERE id = ?"]
    RestoreStock --> DoneLoop{More Items?}
    DoneLoop -- Yes --> LoopItems
    DoneLoop -- No --> CommitCancel[Commit SQLite Transaction: COMMIT]

    CommitCancel --> Revalidate[Revalidate Buyer Dashboard Cache]
    Revalidate --> EndCancel([Order Cancelled & Stock Restored])
```

---

## 3. Administrative Escrow Settlement Workflow

```mermaid
flowchart TD
    AdminStart([Admin Opens Payouts Manager /admin/payouts]) --> QueryBalances[Calculate Gross Sales & Unsettled Escrow per Vendor]
    QueryBalances --> DisplayList[Render Vendor Settlement Cards]
    DisplayList --> SettleAction[Admin Triggers 'Bulk Settle Vendor Payouts']
    SettleAction --> InputNotes[Enter Settlement Reference / Banking Notes]
    InputNotes --> ExecDB[Begin SQLite Transaction: BEGIN]

    ExecDB --> UpdateOrders["UPDATE orders SET seller_payout_status = 'SETTLED', payout_notes = ? WHERE seller_id = ? AND status != 'CANCELLED'"]
    UpdateOrders --> LogAuditEntry["INSERT INTO audit_logs (action = 'BULK_SETTLE_PAYOUTS', target_entity = 'SELLER')"]
    LogAuditEntry --> CommitSettle[Commit SQLite Transaction: COMMIT]

    CommitSettle --> RefreshUI[Revalidate /admin/payouts & Reset Unsettled Balance to 0]
    RefreshUI --> AdminDone([Escrow Disbursed to Vendor])
```

---

## 4. Lakeside Pop-Up Stall Booking & Verification Workflow

```mermaid
flowchart TD
    ClubStart([Student Club Rep Opens Lakeside Map]) --> ClickStall[Select Promenade Stall Location A1-A6]
    ClickStall --> FillBooking[Input Club Name, Event Purpose, Date, Duration]
    FillBooking --> CalcStallFee{Is Representative Verified Student?}
    CalcStallFee -- Yes --> DiscountFee[Apply 15% Verified Student Club Discount]
    CalcStallFee -- No --> StandardFee[Apply Standard Daily Stall Rate]
    DiscountFee --> GeneratePass[Generate Unique Cryptographic Pass Code: STALL-ID-XXXX]
    StandardFee --> GeneratePass

    GeneratePass --> SubmitStall[Submit Stall Reservation Form]
    SubmitStall --> SaveDB["INSERT INTO 'stall_bookings' (status = 'PENDING_APPROVAL')"]
    SaveDB --> ShowPassModal[Display Booking Confirmation & Security Pass Code]

    ShowPassModal --> AdminReview([Campus Authority Reviews in /admin/stalls])
    AdminReview --> AdminDecision{Approve or Reject?}
    AdminDecision -- Reject --> MarkReject["UPDATE stall_bookings SET status = 'REJECTED', admin_notes = ?"]
    AdminDecision -- Approve --> MarkApprove["UPDATE stall_bookings SET status = 'APPROVED'"]
    MarkReject --> EndReview([Application Closed with Feedback])
    MarkApprove --> SecurityGate([Pass Code Validated at BUP Lakeside Security Gate])
```
