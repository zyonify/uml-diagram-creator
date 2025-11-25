# UML Diagram Examples

This file contains examples showcasing all features of the UML Diagram Creator, including websequencediagrams.com compatibility.

## Basic Sequence Diagram with Title and Actors

```
sequence:
  title User Authentication Flow
  actor User
  participant WebApp
  participant AuthServer
  participant Database

  User->WebApp: Enter credentials
  WebApp->AuthServer: Validate user
  AuthServer->Database: Query user
  Database-->AuthServer: User data
  AuthServer-->WebApp: Token
  WebApp-->User: Login success
```

## Sequence Diagram with Notes

```
sequence:
  title Payment Processing System
  actor Customer
  participant Store
  participant PaymentGateway
  participant Bank

  Customer->Store: Select items
  note left of Customer: Reviews cart
  Store->PaymentGateway: Process payment
  note over PaymentGateway: Validates card
  PaymentGateway->Bank: Authorize transaction
  note right of Bank: Checks balance
  Bank-->PaymentGateway: Approved
  note over Store, Customer: Transaction complete
  PaymentGateway-->Store: Success
  Store-->Customer: Order confirmed
```

## Compact Syntax (websequencediagrams.com style)

```
sequence:
  title Compact Syntax Example
  actor Alice
  participant Bob
  participant Charlie

  Alice->Bob: Hello Bob
  Bob->Charlie: Hi Charlie
  Charlie-->Bob: Hey Bob
  Bob-->Alice: Alice, meet Charlie
  note over Alice, Charlie: Now they know each other
```

## Advanced Control Structures

```
sequence:
  title Order Processing with All Control Structures
  actor Customer
  participant OrderService
  participant Inventory
  participant Payment

  Customer->OrderService: Place order

  alt [items available]
    OrderService->Inventory: Reserve items

    opt [customer has discount code]
      OrderService->OrderService: Apply discount
      note over OrderService: Recalculate total
    end

    critical [payment transaction]
      OrderService->Payment: Process payment
      Payment-->OrderService: Payment ID
    end

    par [send notifications]
      OrderService->>Email: Send receipt
      OrderService->>SMS: Send tracking
    end

    loop [for each item]
      Inventory->Inventory: Update stock
    end

    OrderService-->Customer: Order confirmed

  else [out of stock]
    OrderService-->Customer: Items unavailable

    break [cancel order]
      OrderService->OrderService: Rollback
    end
  end
```

## Multiline Text Example

```
sequence:
  title Multiline Text\nDemonstration
  actor User
  participant System

  User->System: Send request\nwith multiple\nlines of text
  note over System: Processing\nMultiple\nSteps
  System-->User: Response with\nmultiline\ncontent
```

## Self-Messages and Async

```
sequence:
  title Self-Messages and Async Calls
  participant Client
  participant Server
  participant Queue

  Client->>Server: Async request (doesn't wait)
  Server->Server: Process request
  Server->>Queue: Enqueue task
  Queue->Queue: Process in background
  Queue-->Server: Task complete
  Server-->Client: Response
```

## Complete Real-World Example

```
sequence:
  title E-Commerce Checkout Flow
  actor Customer
  participant Frontend
  participant API
  participant PaymentService
  participant InventoryService
  participant EmailService

  Customer->Frontend: Click checkout
  note left of Customer: Reviews order

  Frontend->API: Submit order
  note over API: Validates order data

  alt [valid order]
    API->InventoryService: Check availability
    InventoryService-->API: Items available

    critical [atomic transaction]
      API->PaymentService: Charge customer
      PaymentService-->API: Payment successful
      API->InventoryService: Reserve items
      InventoryService-->API: Reserved
    end

    par [send notifications]
      API->>EmailService: Send order confirmation
      API->>EmailService: Send receipt
    end

    seq [ordered steps]
      API->API: Generate order ID
      API->API: Update order status
      API->API: Log transaction
    end

    note over Customer, API: Order completed successfully
    API-->Frontend: Order ID
    Frontend-->Customer: Thank you page

  else [payment failed]
    PaymentService-->API: Payment declined

    break [abort checkout]
      API-->Frontend: Payment error
      Frontend-->Customer: Please try again
    end

  end
```

## Class Diagram Example

```
class:
  Shape {
    #color: string
    #x: int
    #y: int
    +draw()
    +move(dx: int, dy: int)
    +getArea(): double
  }

  Circle extends Shape {
    -radius: double
    +draw()
    +getArea(): double
    +setRadius(r: double)
  }

  Rectangle extends Shape {
    -width: double
    -height: double
    +draw()
    +getArea(): double
  }

  Canvas has Shape {
    +shapes: List<Shape>
    +addShape(s: Shape)
    +removeShape(s: Shape)
    +render()
  }

  Window owns Canvas {
    +title: string
    +width: int
    +height: int
    +show()
    +close()
  }
```

## Comments in Diagrams

```
sequence:
  title Example with Comments
  actor User
  participant Server

  // This is a comment and will be ignored
  User->Server: Request

  # This is also a comment
  Server->Server: Process

  // Comments help document your diagrams
  Server-->User: Response
```

## Tips for Best Results

1. **Use titles** to make diagrams self-documenting
2. **Declare actors and participants** at the top for clarity
3. **Add notes** to explain complex logic
4. **Use compact syntax** (`->`) or spaced syntax (` -> `) - both work!
5. **Leverage multiline text** with `\n` for longer messages
6. **Comment your diagrams** with `//` or `#`
7. **Combine control structures** for complex flows
8. **Choose appropriate arrow types**:
   - `->` for synchronous calls
   - `->>` for async (fire and forget)
   - `-->` for responses/returns
