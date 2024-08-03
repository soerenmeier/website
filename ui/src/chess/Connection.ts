import { Writable } from 'chuchi/stores';
import { Board, History, HistoryMove, Move } from './types';

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
			history: History;
	  }
	| {
			kind: 'NewHistoryMove';
			move: HistoryMove;
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

export type Send = {
	kind: 'MakeMove';
	name: string;
	moveNumber: number;
	move: Move;
};

export default class Connection {
	ws!: WebSocket;
	id!: string;

	board: Writable<Board>;
	history: Writable<History>;

	constructor() {
		this.board = new Writable(null as any);
		this.history = new Writable(null as any);
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

	makeMove(name: string, moveNumber: number, move: Move) {
		const send: Send = {
			kind: 'MakeMove',
			name,
			moveNumber,
			move,
		};

		this.ws.send(JSON.stringify(send));
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
			case 'History':
				recv.history = new History(recv.history);
				this.history.set(recv.history);
				break;
			case 'NewHistoryMove':
				recv.move = new HistoryMove(recv.move);
				this.history.set(this.history.get().cloneAdd(recv.move));
				break;
		}

		console.log('Message', recv);
	}

	private onClose(e: CloseEvent) {
		console.log('Closed', e);
	}
}
