const API_BASE_URL = 'http://localhost:3000';

const getAuthToken = (): string | null => {
	return localStorage.getItem('authToken');
};

const request = async (endpoint: string, method: string, body?: unknown) => {
	const token = getAuthToken();
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const config: RequestInit = {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	};

	const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			error.message || `API request failed: ${response.statusText}`,
		);
	}

	const contentType = response.headers.get('content-type');
	if (contentType && contentType.indexOf('application/json') !== -1) {
		return response.json();
	} else {
		return null;
	}
};

export const getAllRooms = async () => {
	return request('/rooms', 'GET');
};

export const getRoomById = async (roomId: number) => {
	return request(`/rooms/${roomId}`, 'GET');
};

export const createRoom = async (name: string) => {
	return request('/rooms', 'POST', { name });
};

export const addUserToRoom = async (roomId: number) => {
	return request(`/rooms/${roomId}/join`, 'POST');
};

export const removeUserFromRoom = async (
	roomId: number,
	userIdToRemove: number,
) => {
	return request(`/rooms/${roomId}/${userIdToRemove}`, 'DELETE');
};
