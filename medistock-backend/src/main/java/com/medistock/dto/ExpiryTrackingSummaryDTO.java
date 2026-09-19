package com.medistock.dto;

public class ExpiryTrackingSummaryDTO {
    private long totalRecords;
    private long expiredCount;
    private long expiringSoonCount;
    private long activeCount;
    private long expiredQuantity;
    private long expiringSoonQuantity;

    public ExpiryTrackingSummaryDTO() {}

    public ExpiryTrackingSummaryDTO(long totalRecords, long expiredCount, long expiringSoonCount, long activeCount, long expiredQuantity, long expiringSoonQuantity) {
        this.totalRecords = totalRecords;
        this.expiredCount = expiredCount;
        this.expiringSoonCount = expiringSoonCount;
        this.activeCount = activeCount;
        this.expiredQuantity = expiredQuantity;
        this.expiringSoonQuantity = expiringSoonQuantity;
    }

    public long getTotalRecords() { return totalRecords; }
    public void setTotalRecords(long totalRecords) { this.totalRecords = totalRecords; }

    public long getExpiredCount() { return expiredCount; }
    public void setExpiredCount(long expiredCount) { this.expiredCount = expiredCount; }

    public long getExpiringSoonCount() { return expiringSoonCount; }
    public void setExpiringSoonCount(long expiringSoonCount) { this.expiringSoonCount = expiringSoonCount; }

    public long getActiveCount() { return activeCount; }
    public void setActiveCount(long activeCount) { this.activeCount = activeCount; }

    public long getExpiredQuantity() { return expiredQuantity; }
    public void setExpiredQuantity(long expiredQuantity) { this.expiredQuantity = expiredQuantity; }

    public long getExpiringSoonQuantity() { return expiringSoonQuantity; }
    public void setExpiringSoonQuantity(long expiringSoonQuantity) { this.expiringSoonQuantity = expiringSoonQuantity; }

    public static ExpiryTrackingSummaryDTOBuilder builder() { return new ExpiryTrackingSummaryDTOBuilder(); }

    public static class ExpiryTrackingSummaryDTOBuilder {
        private long totalRecords;
        private long expiredCount;
        private long expiringSoonCount;
        private long activeCount;
        private long expiredQuantity;
        private long expiringSoonQuantity;

        public ExpiryTrackingSummaryDTOBuilder totalRecords(long totalRecords) { this.totalRecords = totalRecords; return this; }
        public ExpiryTrackingSummaryDTOBuilder expiredCount(long expiredCount) { this.expiredCount = expiredCount; return this; }
        public ExpiryTrackingSummaryDTOBuilder expiringSoonCount(long expiringSoonCount) { this.expiringSoonCount = expiringSoonCount; return this; }
        public ExpiryTrackingSummaryDTOBuilder activeCount(long activeCount) { this.activeCount = activeCount; return this; }
        public ExpiryTrackingSummaryDTOBuilder expiredQuantity(long expiredQuantity) { this.expiredQuantity = expiredQuantity; return this; }
        public ExpiryTrackingSummaryDTOBuilder expiringSoonQuantity(long expiringSoonQuantity) { this.expiringSoonQuantity = expiringSoonQuantity; return this; }

        public ExpiryTrackingSummaryDTO build() {
            return new ExpiryTrackingSummaryDTO(totalRecords, expiredCount, expiringSoonCount, activeCount, expiredQuantity, expiringSoonQuantity);
        }
    }
}
