/**
 * Converts a number to Thai Baht text representation.
 * Example: 1000 -> "หนึ่งพันบาทถ้วน"
 * 
 * @param number The amount to convert
 * @returns Thai text string
 */
export function thaiBahtText(amount: number): string {
    if (isNaN(amount)) return "";

    const BAHT_TEXT_NUMBERS = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    const BAHT_TEXT_UNITS = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
    const BAHT_TEXT_ONE_IN_TENTH = "เอ็ด";
    const BAHT_TEXT_TWO_IN_TENTH = "ยี่";
    const BAHT_TEXT_INTEGER = "บาท";
    const BAHT_TEXT_FRACTION = "สตางค์";
    const BAHT_TEXT_WHOLE = "ถ้วน";

    let numberStr = parseFloat(amount.toString()).toFixed(2);
    let [integerPart, fractionPart] = numberStr.split(".");

    if (parseInt(fractionPart) === 0) fractionPart = "";

    // Function to convert integer part
    const convert = (numberStr: string): string => {
        let length = numberStr.length;
        let result = "";

        for (let i = 0; i < length; i++) {
            let digit = parseInt(numberStr.charAt(i));
            let unitIndex = (length - i - 1) % 6;

            if (digit !== 0) {
                if (unitIndex === 0 && digit === 1 && length > 1) { // Ends with 1 (ed)
                    // Check if it's the millions position or effectively the "ones" column but not the only digit
                    // Actually, "101" -> Nueng Roi Ed, "11" -> Sib Ed
                    // Complex rule: if it's the last digit of a group (mod 6 == 0) and group > 0
                    result += BAHT_TEXT_ONE_IN_TENTH;
                } else if (unitIndex === 1 && digit === 2) { // 20 (yi sib)
                    result += BAHT_TEXT_TWO_IN_TENTH;
                } else if (unitIndex === 1 && digit === 1) { // 10 (sib), don't say "Nueng Sib"
                    // Do nothing for digit text, just add unit
                } else {
                    result += BAHT_TEXT_NUMBERS[digit];
                }

                result += BAHT_TEXT_UNITS[unitIndex];
            } else if (unitIndex === 6) { // Million position, even if 0 (e.g. 1,000,000) - wait, only if we have value? 
                // Logic: 1,000,000. 1(Million)... 
                // Actually if digit is 0, we generally skip, EXCEPT if it allows the "Million" suffix to chain?
                // Simple logic: Thai reads "Larn" at the 6th power. "Nueng Larn".
            }
        }

        // Fix for "Million" chaining logic which is complex in loop.
        // Let's use a simpler known library logic or simplified recursive approach for clean code.
        return "";
    };

    // Simplified robust implementation without external deps
    // Source adapted for TS:
    const numToThai = (n: string): string => {
        let len = n.length;
        let text = "";

        for (let i = 0; i < len; i++) {
            let digit = parseInt(n[i]);
            let pos = len - i - 1;

            if (digit === 0) continue;

            if (pos % 6 === 0 && pos > 0) {
                // Million logic handled outside or requires grouping
            }

            // Simple block for < 10 million
            // ...
        }
        return "";
    }

    // Let's use a standard robust implementation directly
    const getText = (n: string): string => {
        let res = "";
        for (let i = 0; i < n.length; i++) {
            const digit = parseInt(n[i]);
            const pos = n.length - i - 1;
            const isMillion = pos > 0 && pos % 6 === 0;

            if (digit === 0) {
                if (isMillion) res += "ล้าน";
                continue;
            }

            // 1 at ones place (and not only digit) -> Ed
            if (digit === 1 && pos % 6 === 0 && n.length > 1) {
                res += BAHT_TEXT_ONE_IN_TENTH;
            }
            // 2 at tens place -> Yi
            else if (digit === 2 && pos % 6 === 1) {
                res += BAHT_TEXT_TWO_IN_TENTH;
            }
            // 1 at tens place -> (skip number, just say Sib)
            else if (digit === 1 && pos % 6 === 1) {
                // do nothing
            }
            else {
                res += BAHT_TEXT_NUMBERS[digit];
            }

            res += BAHT_TEXT_UNITS[pos % 6];
            if (isMillion) res += "ล้าน";
        }
        return res;
    };

    // Handling numbers > 1 million simplified:
    // Actually standard JS approach:
    // Split into integer and fraction

    // We can use a simpler approach for < 1 Trillion
    let result = "";

    if (parseFloat(integerPart) === 0) {
        // If 0.xx, integer part is empty text? Or "Soon Baht"? Usually just "... Satang" if 0.xx?
        // But standard invoice usually 0.00 is "Soon Baht Thuan"
        // Let's handle 0
        if (parseFloat(amount.toString()) === 0) return "ศูนย์บาทถ้วน";
    } else {
        result += getText(integerPart);
        result += BAHT_TEXT_INTEGER;
    }

    if (fractionPart && fractionPart.length > 0) {
        if (fractionPart.length === 1) fractionPart += "0"; // 0.5 -> 50 satang
        result += getText(fractionPart) + BAHT_TEXT_FRACTION;
    } else {
        result += BAHT_TEXT_WHOLE;
    }

    return result;
}
