import React, { useState } from 'react';
import { createRoom } from '../api/roomApi';
import handleError from '../utils/handleError';

interface CreateRoomFromProps {
	onRoomCreated: () => void;
}

const CreateRoomForm: React.FC<CreateRoomFromProps> = ({ onRoomCreated }) => {
	const [roomName, setRoomName] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		if (!roomName.trim()) {
			setError('Room name cannot be empty');
			setLoading(false);
			return;
		}

		try {
			await createRoom(roomName);
			setSuccess(true);
			setRoomName('');
			onRoomCreated();
		} catch (err:unknown) {
			handleError(err, setError);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='p-4 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4'>
			<h2 className='text-2x1 font-bold text-center text-gray-800'>Create new room</h2>
			<form onSubmit={handleSubmit} className='flex flex-col space-y-3'>
				<input type='text' placeholder='Room name' value={roomName} onChange={(e) => setRoomName(e.target.value)} className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500' disabled={loading} />
				<button type='submit' className='px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50' disabled={loading}>
					{loading ? 'Creating...' : 'Create room'}
				</button>
			</form>
			{error && <p className='text-center text-red-500 text-sm'>{error}</p>}
			{success && <p className='text-center text-green-500 text-sm'>Room created successfully</p>}
		</div>
	)
}

export default CreateRoomForm;
