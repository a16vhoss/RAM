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
    // Verify ownership via pet_owners table (Family Mode)
    const [ownership] = await db.getAll(`
        SELECT role FROM pet_owners 
        WHERE pet_id = $1 AND user_id = $2
    `, [petId, session.user.user_id]);

    if (!ownership) {
        console.log('[EditPetPage] Redirecting: Unauthorized (Not in pet_owners)');
        redirect("/dashboard");
    }

    // Fetch all owners
    const { getPetOwners } = await import("@/app/actions/family");
    const { owners } = await getPetOwners(petId);

    return <EditPetClient params={resolvedParams} pet={pet} owners={owners} currentUserId={session.user.user_id} />;
}
