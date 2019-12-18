import { SET_ALERT, REMOVE_ALERT } from '../actions/consts';

const intialState = [];

export default function(state = intialState, action) {
	switch (action.type) {
		case SET_ALERT:
			return [...state, action.payload];
		case REMOVE_ALERT:
			return state.filter((alert) => alert.id !== action.payload);
		default:
			return state;
	}
}
