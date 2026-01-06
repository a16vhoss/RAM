import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import EditPetClient from "./EditPetClient";

export default async function EditPetPage({ params }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const [pet] = await db.getAll('SELECT * FROM pets WHERE pet_id = $1', [params.id]);

    if (!pet) redirect("/dashboard");
    if (pet.user_id !== session.user.user_id) redirect("/dashboard");

    return <EditPetClient params={params} pet={pet} />;
}
