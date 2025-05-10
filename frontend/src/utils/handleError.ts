import React from 'react';

function handleError(
	err: unknown,
	setError: React.Dispatch<React.SetStateAction<string | null>>,
) {
	if (err instanceof Error) {
		setError(err.message);
	} else {
		setError('An unknown error occurried');
	}
}

export default handleError;
