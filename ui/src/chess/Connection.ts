import { Writable } from 'chuchi/stores';
import { Board, History, HistoryMove, Move } from './types';

export type Receive =
	| {
			kind: 'Init';
			id: string;
			board: Board;
			history: History;
	  }
	| {
			kind: 'Update';
			board: Board;
			history: HistoryMove;
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

	board: Writable<Board | null>;
	history: Writable<History | null>;

	constructor() {
		this.board = new Writable(null);
		this.history = new Writable(null);
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

	restart() {
		this.ws.send(JSON.stringify({ kind: 'Init' }));
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
			case 'Init':
				this.id = recv.id;
				recv.board = new Board(recv.board);
				recv.history = new History(recv.history);
				this.board.set(recv.board);
				this.history.set(recv.history);
				break;
			case 'Update':
				recv.board = new Board(recv.board);
				recv.history = new HistoryMove(recv.history);
				this.board.set(recv.board);
				this.history.set(this.history.get()!.cloneAdd(recv.history));
				break;
		}

		console.log('Message', recv);
	}

	private onClose(e: CloseEvent) {
		console.log('Closed', e);
	}
}
