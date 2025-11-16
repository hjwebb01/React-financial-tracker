#include <stdint.h>
// Sum an array of 32-bit integers.
// Returns 0 if length <= 0 or ptr is null (simple safety).
int32_t sum_int32(const int32_t *values, int32_t length) {
    if (values == 0 || length <= 0) {
        return 0;
    }

    int64_t total = 0;
    for (int32_t i = 0; i < length; i++) {
        total += values[i];
    }

    // Clamp to 32-bit range (demo; avoids overflow UB).
    if (total > 2147483647) {
        total = 2147483647;
    } else if (total < -2147483648LL) {
        total = -2147483648LL;
    }

    return (int32_t) total;
}

// Sum amounts for a specific category within date range.
// timestamps in milliseconds since epoch.
// The time range is half-open: [start_ts, end_ts), i.e., start_ts is inclusive and end_ts is exclusive.
// Returns sum in cents.
int32_t sum_by_category(int32_t category_index, int64_t start_ts, int64_t end_ts, const int64_t *timestamps, const int32_t *amounts, const int32_t *category_indices, int32_t length) {
int32_t sum_by_category(int32_t category_index, int64_t start_ts, int64_t end_ts, const int64_t *timestamps, const int32_t *amounts, const int32_t *category_indices, int32_t length) {
    if (timestamps == 0 || amounts == 0 || category_indices == 0 || length <= 0) {
        return 0;
    }

    int64_t total = 0;
    for (int32_t i = 0; i < length; i++) {
        if (category_indices[i] == category_index && timestamps[i] >= start_ts && timestamps[i] < end_ts) {
            total += amounts[i];
        }
    }

    // Clamp to 32-bit
    if (total > 2147483647) {
        total = 2147483647;
    } else if (total < -2147483648LL) {
        total = -2147483648LL;
    }

    return (int32_t) total;
}

// Sum amounts for a specific month.
// year: e.g. 2025, month: 0-11
int32_t sum_by_month(int32_t year, int32_t month, const int64_t *timestamps, const int32_t *amounts, int32_t length) {
    if (timestamps == 0 || amounts == 0 || length <= 0) {
        return 0;
    }

    int64_t total = 0;
    for (int32_t i = 0; i < length; i++) {
        int64_t ts = timestamps[i];
        // Convert timestamp (ms since epoch) to year and month (UTC)
        int64_t days = ts / 86400000;
        int64_t y = 1970;
        int64_t m = 0;
        int64_t d = 0;
        int64_t days_in_month[] = {31,28,31,30,31,30,31,31,30,31,30,31};
        // Calculate year
        while (1) {
            int leap = ((y % 4 == 0 && y % 100 != 0) || (y % 400 == 0)) ? 1 : 0;
            int days_this_year = leap ? 366 : 365;
            if (days >= days_this_year) {
                days -= days_this_year;
                y++;
            } else {
                break;
            }
        }
        // Calculate month
        for (m = 0; m < 12; m++) {
            int dim = days_in_month[m];
            // February leap year
            if (m == 1 && ((y % 4 == 0 && y % 100 != 0) || (y % 400 == 0))) {
                dim = 29;
            }
            if (days >= dim) {
                days -= dim;
            } else {
                break;
            }
        }
        d = days + 1;
        if (y == year && m == month) {
            total += amounts[i];
        }
    }

    if (total > 2147483647) {
        total = 2147483647;
    } else if (total < -2147483648LL) {
        total = -2147483648LL;
    }

    return (int32_t) total;
}