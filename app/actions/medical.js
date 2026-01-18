
// Client-side wrapper for Medical Actions
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function rpc(action, data = {}, isMultipart = false) {
    try {
        let options = {
            method: 'POST',
        };

        if (isMultipart) {
            const formData = data;
            formData.append('action', action);
            options.body = formData;
        } else {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify({ action, data })
        }

        const response = await fetch(`${API_BASE}/api/rpc/medical`, options);
        if (response.status === 401) return { success: false, error: 'Unauthorized' };
        return await response.json();
    } catch (error) {
        console.error(`RPC error ${action}:`, error);
        return { success: false, error: 'Network error' };
    }
}

export async function getMedicalRecords(petId) {
    return rpc('getMedicalRecords', { petId });
}

export async function addMedicalRecord(formData) {
    // Assuming formData has everything needed.
    return rpc('addMedicalRecord', formData, true);
}

export async function updateMedicalRecord(formData) {
    return rpc('updateMedicalRecord', formData, true);
}

export async function deleteMedicalRecord(recordId, petId) {
    return rpc('deleteMedicalRecord', { recordId, petId });
}
