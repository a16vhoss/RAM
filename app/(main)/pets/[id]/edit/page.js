import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import EditPetClient from "./EditPetClient";

export default async function EditPetPage({ params }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const resolvedParams = await params;
    const petId = resolvedParams.id;

    console.log('[EditPetPage] ID:', petId);

    const [pet] = await db.getAll('SELECT * FROM pets WHERE pet_id = $1', [petId]);

    console.log('[EditPetPage] Pet Found:', !!pet);

    if (!pet) {
        console.log('[EditPetPage] Redirecting: Pet not found');
        redirect("/dashboard");
    }
    if (pet.user_id !== session.user.user_id) {
        console.log('[EditPetPage] Redirecting: Unauthorized');
        redirect("/dashboard");
    }

    return <EditPetClient params={resolvedParams} pet={pet} />;
}
