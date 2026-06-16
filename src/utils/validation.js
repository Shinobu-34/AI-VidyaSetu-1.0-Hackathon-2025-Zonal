
/**
 * Validates an Indian phone number.
 * Rules:
 * - Must be 10 digits
 * - Can start with +91 (which is ignored/stripped)
 * - If starts with other +, it is rejected
 * 
 * @param {string} phone 
 * @returns {Object} { isValid: boolean, error: string, value: string }
 */
export function validateIndianPhone(phone) {
    if (!phone) return { isValid: false, error: 'Phone number is required' };

    // Remove spaces, dashes, parentheses
    let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Check for non-Indian prefix
    if (cleanPhone.startsWith('+')) {
        if (!cleanPhone.startsWith('+91')) {
            return { isValid: false, error: 'Sorry, only Indian phone numbers are accepted.' };
        }
        // Remove +91
        cleanPhone = cleanPhone.substring(3);
    }

    // Check if it's exactly 10 digits
    if (!/^\d{10}$/.test(cleanPhone)) {
        return { isValid: false, error: 'Please enter a valid 10-digit mobile number.' };
    }

    return { isValid: true, value: cleanPhone };
}
