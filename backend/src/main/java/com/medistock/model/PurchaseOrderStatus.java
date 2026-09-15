package com.medistock.model;

/**
 * Lifecycle of a Purchase (restock order), per the requested workflow:
 * Admin creates Purchase Order -> Supplier accepts/rejects -> Supplier
 * updates dispatch status -> Admin receives the medicines -> Stock is
 * updated.
 *
 * Stock only changes when a purchase reaches RECEIVED — never at
 * creation. See PurchaseService.receivePurchase().
 */
public enum PurchaseOrderStatus {
    /** Order created by Admin, waiting for the supplier to respond. */
    PENDING,
    /** Supplier accepted the order and is expected to fulfil it. */
    ACCEPTED,
    /** Supplier declined the order. Terminal state — no stock change. */
    REJECTED,
    /** Supplier has shipped/dispatched the order. */
    DISPATCHED,
    /** Admin has physically received the medicines. Stock is increased at this point. Terminal state. */
    RECEIVED,
    /** Order called off before receipt (by Admin). Terminal state — no stock change. */
    CANCELLED
}
