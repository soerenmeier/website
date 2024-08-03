import { Writable } from 'chuchi/stores';
import { Board } from './types';
import Listeners from 'chuchi-utils/sync/Listeners';

export type Receive =
	| {
			kind: 'Hi';
			id: string;
	  }
	| {
			kind: 'Board';
			board: Board;
	  }
	| {
			kind: 'History';
			history: unknown;
	  }
	| {
			kind: 'NewHistoryMove';
			move: unknown;
	  }
	| {
			kind: 'AlreadyMoved';
	  }
	| {
			kind: 'ToSlow';
			name: string;
	  }
	| {
			kind: 'WrongMove';
	  };

export default class Connection {
	ws!: WebSocket;
	id!: string;

	board: Writable<Board>;

	constructor() {
		this.board = new Writable(null as any);
	}

	connect() {
		this.ws = new WebSocket('ws://localhost:4986/api/chess');

		this.ws.addEventListener('open', e => this.onOpen(e));
		this.ws.addEventListener('error', e => this.onError(e));
		this.ws.addEventListener('message', e => this.onMessage(e));
		this.ws.addEventListener('close', e => this.onClose(e));
	}

	disconnect() {
		this.ws.close();
	}

	private onOpen(e: Event) {
		console.log('Connected');
	}

	private onError(e: Event) {
		console.log('Error', e);
	}

	private onMessage(e: MessageEvent) {
		const recv: Receive = JSON.parse(e.data);
		switch (recv.kind) {
			case 'Hi':
				this.id = recv.id;
				break;
			case 'Board':
				recv.board = new Board(recv.board);
				this.board.set(recv.board);
				break;
		}

		console.log('Message', recv);
	}

	private onClose(e: CloseEvent) {
		console.log('Closed', e);
	}
}
