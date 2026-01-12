import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
	switch (_req.method) {
		case "POST":
			res.status(201).json({ message: "todoを作成しました" });
			break;
		case "PATCH":
			res.status(200).json({ message: "todoを更新しました" });
			break;
		case "PUT":
			res.status(200).json({ message: "todoを更新しました" });
			break;
		case "DELETE":
			res.status(204).json({ message: "todoを削除しました" });
			break;
		default:
			res.status(405).json({ message: "エラー" });
			break;
	}
}
