
// Client-side wrapper for Pet Actions

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function rpc(action, data = {}, isMultipart = false) {
    try {
        let options = {
            method: 'POST',
        };

        if (isMultipart) {
            const formData = data; // data is already FormData
            formData.append('action', action);
            options.body = formData;
            // Don't set Content-Type header, browser does it with boundary
        } else {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify({ action, data });
        }

        const response = await fetch(`${API_BASE}/api/rpc/pet`, options);

        if (response.status === 401) {
            return { success: false, error: 'Unauthorized' };
        }

        return await response.json();
    } catch (error) {
        console.error(`RPC error ${action}:`, error);
        return { success: false, error: 'Network error or server error' };
    }
}

// NOTE: createPet accepts FormData because it handles file uploads
export async function createPet(formData) {
    return rpc('createPet', formData, true);
}

export async function deletePet(petId) {
    return rpc('deletePet', { petId });
}

export async function toggleLostPetStatus(petId, isLost, location = null, radius = 5, message = '') {
    return rpc('toggleLostPetStatus', { petId, isLost, location, radius, message });
}

// NOTE: updatePet accepts FormData because it handles file uploads
export async function updatePet(petId, formData) {
    // If updatePet implementation expects petId inside formData or separate?
    // Original action signature: updatePet(petId, formData)
    // We should append petId to formData to send it all in one multipart body
    formData.append('petId', petId);
    return rpc('updatePet', formData, true);
}

export async function getLostPets({ city = '', species = '', query = '' } = {}) {
    return rpc('getLostPets', { city, species, query });
}

