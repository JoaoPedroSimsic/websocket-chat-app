import React, { useEffect, useState } from 'react';
import { getAllRooms } from '../api/roomApi';

import handleError from '../utils/handleError';

interface RoomListItem {
	id: number;
	name: string;
	members: { username: string }[];
}

interface RoomListProps {
	onSelectRoom: (roomId: number) => void;
	onRoomCreated: () => void;
}

const RoomList: React.FC<RoomListProps> = ({ onSelectRoom, onRoomCreated }) => {
	const [rooms, setRooms] = useState<RoomListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchRooms = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await getAllRooms();
			setRooms(data as RoomListItem[]);
		} catch (err: unknown) {
			handleError(err, setError);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRooms();
	}, [onRoomCreated]);

	if (loading) {
		return <div className="text-center text-gray-600">Loading rooms...</div>;
	}

	if (error) {
		return <div className="text-center text-red-500">Error: {error}</div>;
	}

	return (
		<div className="p-4 max-w-sm mx-auto bg-white rounded-x1 shadow-md space-y-4">
			<h2 className="text-2x1 font-bold text-center text-gray-800">Rooms</h2>
			{rooms.length === 0 ? (
				<p className="text-center text-gray-500">No rooms available.</p>
			) : (
				<ul className="space-y-2">
					{rooms.map((room) => {
						return (
							<li
								key={room.id}
								className="p-3 bg-gray-100 rounded-md cursor-pointer hover:bg-blue-100 transition duration-200"
								onClick={() => onSelectRoom(room.id)}
							>
								<span className="font-semibold text-gray-700">{room.name}</span>
								{room.members && (
									<span className="ml-2 text-sm text-gray-500">
										({room.members.length} members)
									</span>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default RoomList;
