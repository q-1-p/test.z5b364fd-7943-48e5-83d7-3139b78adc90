import { useEffect, useRef, useState } from "react";

import styles from "@/styles/Home.module.css";

interface ToDo {
	id: string;
	title: string;
	content: string;
	completed: boolean;
	createdAt: string;
	updatedAt: string;
}

function ToDoBar({
	todo,
	toggleTodo,
	deleteTodo,
	onUpdate,
}: {
	todo: ToDo;
	toggleTodo: (id: string) => void;
	deleteTodo: (id: string, e: React.MouseEvent) => void;
	onUpdate: (id: string, title: string, content: string) => void;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState(todo.title);
	const [editContent, setEditContent] = useState(todo.content);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const handleSave = () => {
		if (!editTitle.trim()) return;
		onUpdate(todo.id, editTitle, editContent);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditTitle(todo.title);
		setEditContent(todo.content);
		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<div className={`${styles.todoBar} ${styles.editing}`}>
				<div className={styles.todoContent}>
					<input
						ref={inputRef}
						type="text"
						className={styles.todoInput}
						value={editTitle}
						onChange={(e) => setEditTitle(e.target.value)}
						placeholder="タイトル"
					/>
					<textarea
						className={styles.todoTextarea}
						value={editContent}
						onChange={(e) => setEditContent(e.target.value)}
						placeholder="内容"
						rows={3}
					/>
					<div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
						<button
							type="button"
							onClick={handleSave}
							style={{
								padding: "0.25rem 0.5rem",
								background: "#667eea",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
							}}
						>
							Save
						</button>
						<button
							type="button"
							onClick={handleCancel}
							style={{
								padding: "0.25rem 0.5rem",
								background: "#e2e8f0",
								color: "#4a5568",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
							}}
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`${styles.todoBar} ${todo.completed ? styles.completed : ""}`}
		>
			<input
				type="checkbox"
				className={styles.checkbox}
				checked={todo.completed}
				onChange={() => toggleTodo(todo.id)}
			/>
			<div className={styles.todoContent}>
				<div className={styles.todoTitle}>{todo.title}</div>
				<div className={styles.todoText}>{todo.content}</div>
			</div>
			<button
				type="button"
				onClick={() => setIsEditing(true)}
				className={styles.editButton}
				aria-label="Edit task"
			>
				✎
			</button>
			<button
				type="button"
				className={styles.deleteButton}
				onClick={(e) => deleteTodo(todo.id, e)}
				aria-label="Delete task"
			>
				×
			</button>
		</div>
	);
}

const STORAGE_KEY = "todos";

export default function Home() {
	const [todos, setTodos] = useState<ToDo[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [contentValue, setContentValue] = useState("");

	// ローカルストレージからデータを読み込む
	useEffect(() => {
		const storedTodos = localStorage.getItem(STORAGE_KEY);
		if (storedTodos) {
			try {
				setTodos(JSON.parse(storedTodos));
			} catch (e) {
				console.error("Failed to parse todos from localStorage:", e);
			}
		}
		setIsLoaded(true);
	}, []);

	// todosが変更されたらローカルストレージに保存する
	useEffect(() => {
		if (isLoaded) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
		}
	}, [todos, isLoaded]);

	const handleAddTodo = async () => {
		if (!inputValue.trim()) return;
		const { message } = await fetch(`/api/todo`, {
			method: "POST",
			body: JSON.stringify({
				title: inputValue,
				content: contentValue,
			}),
		}).then((res) => res.json());
		const newTodo: ToDo = {
			id: Date.now().toString(),
			title: inputValue,
			content: contentValue,
			completed: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setTodos([newTodo, ...todos]);
		setInputValue("");
		setContentValue("");
		alert(message);
	};

	const handleToggleTodo = async (id: string) => {
		const { message } = await fetch(`/api/todo`, {
			method: "PUT",
			body: JSON.stringify({
				completed: !todos.find((todo) => todo.id === id)?.completed,
			}),
		}).then((res) => res.json());
		setTodos(
			todos.map((todo) =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo,
			),
		);
		alert(message);
	};

	const handleUpdateTodo = async (
		id: string,
		title: string,
		content: string,
	) => {
		const { message } = await fetch(`/api/todo`, {
			method: "PUT",
			body: JSON.stringify({ title, content }),
		}).then((res) => res.json());
		setTodos(
			todos.map((todo) =>
				todo.id === id
					? { ...todo, title, content, updatedAt: new Date().toISOString() }
					: todo,
			),
		);
		alert(message);
	};

	const handleDeleteTodo = async (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const { message } = await fetch(`/api/todo`, {
			method: "DELETE",
		}).then((res) => res.json());
		setTodos(todos.filter((todo) => todo.id !== id));
		alert(message);
	};

	return (
		<main className={styles.container}>
			<div className={styles.contentWrapper}>
				<header className={styles.header}>
					<h1 className={styles.title}>ToDoアプリ</h1>
					<p className={styles.subtitle}>
						残存タスク数：{todos.filter((t) => !t.completed).length}
					</p>
				</header>

				<div className={styles.todoList}>
					{todos.map((todo) => (
						<ToDoBar
							key={todo.id}
							todo={todo}
							toggleTodo={handleToggleTodo}
							deleteTodo={handleDeleteTodo}
							onUpdate={handleUpdateTodo}
						/>
					))}
					{todos.length === 0 && (
						<div className={styles.emptyState}>
							<p>No tasks yet. Add one below!</p>
						</div>
					)}
				</div>

				<div className={styles.inputArea}>
					<div className={styles.inputGroup}>
						<input
							type="text"
							className={styles.todoInput}
							placeholder="タイトル"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
						/>
						<textarea
							className={styles.todoTextarea}
							placeholder="内容"
							value={contentValue}
							onChange={(e) => setContentValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
									handleAddTodo();
								}
							}}
						/>
					</div>
					<button
						type="button"
						className={styles.addButton}
						onClick={handleAddTodo}
						aria-label="Add task"
					>
						<span>＋</span>
					</button>
				</div>
			</div>
		</main>
	);
}
