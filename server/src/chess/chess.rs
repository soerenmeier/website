use std::{
	convert::Infallible,
	sync::{Arc, RwLock},
};

use chuchi::{
	extractor::Extractor, extractor_extract, extractor_prepare,
	extractor_validate, Error,
};
use tokio::{
	sync::{broadcast, mpsc},
	task::JoinHandle,
};

use super::types::Board;

#[derive(Debug, Clone)]
pub enum Broadcast {}

#[derive(Debug, Clone)]
enum Request {}

#[derive(Debug)]
pub struct Chess {
	rx: broadcast::Receiver<Broadcast>,
	tx: mpsc::Sender<Request>,
	inner: Arc<RwLock<Inner>>,
}

impl Chess {
	pub fn current_board(&self) -> Board {
		self.inner.read().unwrap().board.clone()
	}

	pub async fn receive(&mut self) -> Option<Broadcast> {
		self.rx.recv().await.ok()
	}
}

impl<'a, R> Extractor<'a, R> for Chess {
	type Error = Infallible;
	type Prepared = Self;

	extractor_validate!(|validate| {
		assert!(
			validate.resources.exists::<ChessSubscriber>(),
			"ChessSubscriber is not registered"
		);
	});

	extractor_prepare!(|prep| {
		let sub = prep.resources.get::<ChessSubscriber>().unwrap();

		Ok(sub.subscribe())
	});

	extractor_extract!(|ext| { Ok(ext.prepared) });
}

// the manager is responsible for
// storing the state of the game
// triggered events for interested parties if something changes
// keep the last few games?
#[derive(Debug, Clone)]
pub struct ChessSubscriber {
	sub: broadcast::Sender<Broadcast>,
	tx: mpsc::Sender<Request>,
	inner: Arc<RwLock<Inner>>,
}

impl ChessSubscriber {
	pub fn new() -> (Self, JoinHandle<()>) {
		let inner = Arc::new(RwLock::new(Inner::new()));

		let (tx, rx) = mpsc::channel(5);
		let (sub, _) = broadcast::channel(5);

		let me = Self {
			sub: sub.clone(),
			tx,
			inner: inner.clone(),
		};

		(
			me,
			tokio::spawn(async move { bg_task(inner, rx, sub).await.unwrap() }),
		)
	}

	pub fn subscribe(&self) -> Chess {
		Chess {
			rx: self.sub.subscribe(),
			tx: self.tx.clone(),
			inner: self.inner.clone(),
		}
	}
}

#[derive(Debug)]
struct Inner {
	board: Board,
}

impl Inner {
	pub fn new() -> Self {
		let mut board = Board::new();
		// todo implement storage
		board.set_start_position();

		Self { board }
	}
}

async fn bg_task(
	inner: Arc<RwLock<Inner>>,
	mut rx: mpsc::Receiver<Request>,
	tx: broadcast::Sender<Broadcast>,
) -> Result<(), Error> {
	loop {
		let req = rx.recv().await.unwrap();

		eprintln!("{req:?} bg_task")
	}
}
