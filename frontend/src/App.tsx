/* import { useState } from 'react';
import RoomList from './components/RoomList';
import CreateRoomForm from './components/CreateRoomForm';
import RoomDetail from './components/RoomDetail'; */

import LoginPage from './pages/Login/LoginPage';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './style.css';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<LoginPage />} />
			</Routes>
		</Router>
	);
	/* const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
	const [currentUserId] = useState<number | null>(1);

	const handleSelectRoom = (roomId: number) => {
		setSelectedRoomId(roomId);
	};

	const handleBackToList = () => {
			setSelectedRoomId(null);
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
				Chat Application
			</h1>

			{selectedRoomId === null ? (
				<div className="space-y-8">
					<CreateRoomForm onRoomCreated={() => {}} />
					<RoomList onSelectRoom={handleSelectRoom} onRoomCreated={() => { }} />
				</div>
			) : currentUserId !== null ? (
				<RoomDetail
					roomId={selectedRoomId}
					onBackToList={handleBackToList}
					currentUserId={currentUserId}
				/>
			) : (
				<div className="text-center text-red-500">
					Please log in to view room details.
				</div>
			)}
		</div>
	); */
}

export default App;
