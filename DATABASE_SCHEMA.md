# DevX Payment Workflow Database Schema

This document outlines the suggested database schema for the DevX Payment Sheet application.

## 1. `Users` Table
Stores information about the employees using the system.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique identifier for the user |
| `name` | VARCHAR(255) | NOT NULL | Full name of the user |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email address for login |
| `role` | VARCHAR(50) | NOT NULL | Enum: 'Purchase', 'Accounts', 'Compliance', 'Payments', 'Admin' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

## 2. `Vendors` Table
Stores vendor details for payments.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique identifier for the vendor |
| `name` | VARCHAR(255) | NOT NULL | Vendor company name |
| `gstin` | VARCHAR(15) | UNIQUE | GST Identification Number |
| `pan_number` | VARCHAR(10) | UNIQUE | PAN Number for TDS calculation |
| `bank_account` | VARCHAR(50) | | Bank account number |
| `ifsc_code` | VARCHAR(20) | | Bank IFSC code |
| `annual_billing` | DECIMAL(15,2)| DEFAULT 0.00 | Tracked for TDS 194Q (> 50 Lacs) |

## 3. `Projects` Table
Stores project details against which POs are raised.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique identifier for the project |
| `name` | VARCHAR(255) | NOT NULL | Project name |
| `budget` | DECIMAL(15,2)| | Total allocated budget |
| `status` | VARCHAR(50) | | 'Active', 'Completed', 'On Hold' |

## 4. `PO_Details` Table
Stores the Purchase Order details.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique PO identifier |
| `po_number` | VARCHAR(100) | UNIQUE, NOT NULL | Human-readable PO number |
| `project_id` | UUID | FOREIGN KEY | Refers to `Projects.id` |
| `vendor_id` | UUID | FOREIGN KEY | Refers to `Vendors.id` |
| `nature_of_work`| TEXT | | Description of the work |
| `total_amount` | DECIMAL(15,2)| NOT NULL | Total PO value |
| `status` | VARCHAR(50) | | 'Open', 'Partially Paid', 'Closed', 'Fully Paid' |

## 5. `Payment_Workflow` Table (The Core Request Table)
Tracks the state of each payment request as it moves through the departments.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique request identifier |
| `po_id` | UUID | FOREIGN KEY | Refers to `PO_Details.id` |
| `payment_type` | VARCHAR(50) | NOT NULL | 'Advance', 'Partial', 'Final' |
| `paid_amount_rs`| DECIMAL(15,2)| NOT NULL | Amount requested by Purchase |
| `need_to_pay` | BOOLEAN | DEFAULT FALSE | High priority flag |
| `bill_amount` | DECIMAL(15,2)| | Verified by Accounts |
| `outstanding` | DECIMAL(15,2)| | Calculated by Accounts |
| `tds_194c` | DECIMAL(15,2)| | Calculated by Compliance |
| `tds_194q` | DECIMAL(15,2)| | Calculated by Compliance |
| `final_payable` | DECIMAL(15,2)| | Calculated by Compliance |
| `current_stage` | VARCHAR(50) | NOT NULL | 'Purchase', 'Accounts', 'Compliance', 'Payments' |
| `status` | VARCHAR(50) | NOT NULL | 'Pending Accounts', 'Pending Compliance', 'Pending Payment', 'Paid', 'Rejected' |
| `created_by` | UUID | FOREIGN KEY | Refers to `Users.id` (Purchase User) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When the request was initiated |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

## 6. `Audit_Logs` Table
Maintains the required audit trail for every action.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique log identifier |
| `request_id` | UUID | FOREIGN KEY | Refers to `Payment_Workflow.id` |
| `user_id` | UUID | FOREIGN KEY | Refers to `Users.id` |
| `action` | VARCHAR(255) | NOT NULL | E.g., 'Approved by Accounts', 'Rejected' |
| `remarks` | TEXT | | Optional remarks provided by the user |
| `timestamp` | TIMESTAMP | DEFAULT NOW() | Exact time of the action |
