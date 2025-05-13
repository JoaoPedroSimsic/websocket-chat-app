import React, { useState } from 'react';
// import validator from 'validator';

interface LoginState {
	email: string;
	password: string;
	error: string | null;
	loading: boolean;
}

interface LoginErrorResponse {
	errors?: string[];
	message?: string;
}

function isObjectWithMessage(err: unknown): err is { message: string } {
	return (
		typeof err === 'object' &&
			err !== null &&
			'message' in err &&
			typeof (err as { message: unknown }).message === 'string' // Use a temporary assertion for the check
	);
}

// Custom type guard to check if an unknown value is an object with an array of strings errors property
function isObjectWithErrors(err: unknown): err is { errors: string[] } {
	return (
		typeof err === 'object' &&
			err !== null &&
			'errors' in err &&
			Array.isArray((err as { errors: unknown }).errors) && // Check if it's an array
			// Optional: Check if all elements in the array are strings (more thorough)
			(err as { errors: unknown[] }).errors.every(item => typeof item === 'string')
	);
}


// Helper function to safely extract an error message from an unknown error type
function getErrorMessage(err: unknown): string {
	if (err instanceof Error) {
		return err.message;
	}
	// Use the custom type guards
	if (isObjectWithMessage(err)) {
		return err.message;
	}
	if (isObjectWithErrors(err)) {
		// Since the type guard confirms it's string[], we can safely join
		return err.errors.join(', ');
	}
	// Fallback for anything else
	return 'An unexpected error occurred.';
}

const LoginForm: React.FC = () => {

	const [loginState, setLoginState] = useState<LoginState>({
		email: '',
		password: '',
		error: null,
		loading: false,
	})

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setLoginState(prevState => ({
			...prevState,
			[name]: value,
			error: null,
		}))
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoginState(prevState => ({ ...prevState, error: null, loading: true }))

		const backendUrl = 'http://localhost:3000';
		const loginEndpoint = `${backendUrl}/auth/login`;

		try {
			const response = await fetch(loginEndpoint, {
				method: 'POST',
				headers: {
					'Contente-Type': 'application/json',
				},
				body: JSON.stringify({
					email: loginState.email,
					password: loginState.password,
				})
			});

			if (!response.ok) {
				const errorData: LoginErrorResponse = await response.json();
				const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Login failed';
				throw new Error(errorMessage);
			}

			const successData = await response.json();
			console.log('Login successful', successData);
			alert('Success');
		} catch (err: unknown) {
			console.error('Login error:', err); // Use console.error

			// Use the helper function to get the error message safely
			const errorMessage = getErrorMessage(err);

			setLoginState(prevState => ({
				...prevState,
				error: errorMessage, // Set the determined error message
			}));
		} finally {
			setLoginState(prevState => ({ ...prevState, loading: false }));
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-md w-full max-w-md">
				<h3 className="text-2xl font-bold text-center">Login to your account</h3>
				<form onSubmit={handleSubmit}>
					<div className="mt-4">
						<div>
							<label className="block" htmlFor="email">Email</label>
							<input
								type="email"
								placeholder="Email"
								className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
								name="email"
								id="email"
								value={loginState.email}
								onChange={handleInputChange}
								required
							/>
						</div>
						<div className="mt-4">
							<label className="block" htmlFor="password">Password</label>
							<input
								type="password"
								placeholder="Password"
								className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
								name="password"
								id="password"
								value={loginState.password}
								onChange={handleInputChange}
								required
							/>
						</div>
						{loginState.error && (
							<div className="mt-4 text-red-500 text-sm">
								{loginState.error}
							</div>
						)}
						<div className="flex items-baseline justify-between">
							<button
								type="submit"
								className={`px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 ${loginState.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
								disabled={loginState.loading}
							>
								{loginState.loading ? 'Logging In...' : 'Login'}
							</button>
							{/* Add a link for forgot password or signup if needed */}
							{/* <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a> */}
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default LoginForm;

