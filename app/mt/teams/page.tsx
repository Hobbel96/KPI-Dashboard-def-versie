import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createTeamAction, deleteTeamAction, assignAmToTeamAction } from "@/app/actions/teams";
import { DeleteForm } from "@/components/DeleteForm";

export default async function TeamsPage() {
  await requireAuth("MT");

  const teams = await db.team.findMany({
    include: {
      members: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const allAMs = await db.user.findMany({
    where: { role: "AM" },
    orderBy: { name: "asc" },
  });

  const unassignedAMs = allAMs.filter((am) => !am.teamId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-serif text-charcoal">Teams Beheren</h2>
        <p className="text-text-muted mt-2">Maak teams aan en wijs accountmanagers toe</p>
      </div>

      {/* Create Team Form */}
      <div className="bg-surface rounded-lg border border-line p-6">
        <h3 className="text-lg font-bold text-charcoal mb-4">Nieuw Team</h3>
        <form action={createTeamAction} className="flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="Team naam"
            required
            className="flex-1 px-4 py-2 border border-line rounded"
          />
          <button
            type="submit"
            className="bg-brand-orange text-white px-6 py-2 rounded hover:bg-brand-orange-dark"
          >
            + Team aanmaken
          </button>
        </form>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {teams.length === 0 ? (
          <div className="bg-surface rounded-lg border border-line p-8 text-center text-text-muted">
            Nog geen teams aangemaakt
          </div>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="bg-surface rounded-lg border border-line p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-charcoal">{team.name}</h3>
                <DeleteForm
                  action={deleteTeamAction}
                  itemId={team.id}
                  itemName={team.name}
                  itemLabel="Team"
                />
              </div>

              {/* Team Members */}
              <div className="mb-4">
                <p className="text-sm font-medium text-charcoal mb-2">
                  Leden ({team.members.length})
                </p>
                {team.members.length === 0 ? (
                  <p className="text-xs text-text-muted">Geen teamleden</p>
                ) : (
                  <ul className="space-y-2">
                    {team.members.map((member) => (
                      <li
                        key={member.id}
                        className="flex justify-between items-center px-3 py-2 bg-bg-soft rounded text-sm"
                      >
                        <span>{member.name}</span>
                        <form action={assignAmToTeamAction}>
                          <input type="hidden" name="userId" value={member.id} />
                          <input type="hidden" name="teamId" value="" />
                          <button
                            type="submit"
                            className="text-status-red text-xs hover:underline"
                          >
                            Verwijderen
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Add Members */}
              {allAMs.length > team.members.length && (
                <form action={assignAmToTeamAction} className="flex gap-2">
                  <select
                    name="userId"
                    defaultValue=""
                    className="flex-1 px-3 py-2 border border-line rounded text-sm"
                    required
                  >
                    <option value="">Selecteer accountmanager...</option>
                    {allAMs.map((am) => (
                      <option key={am.id} value={am.id}>
                        {am.name}
                      </option>
                    ))}
                  </select>
                  <input type="hidden" name="teamId" value={team.id} />
                  <button
                    type="submit"
                    className="bg-brand-orange text-white px-4 py-2 rounded text-sm hover:bg-brand-orange-dark"
                  >
                    Toevoegen
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
