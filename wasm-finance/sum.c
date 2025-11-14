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