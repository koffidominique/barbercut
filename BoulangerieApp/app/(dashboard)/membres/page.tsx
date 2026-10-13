import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Users, Plus } from "lucide-react"

export default function MembresPage() {
    return (
        <div className="relative min-h-screen w-full px-6 py-10 lg:px-12">
            {/* Background Blob */}
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black mb-2 dark:text-white text-neutral-900">
                        Gestion des <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">membres</span>
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">Gérez les accès et les rôles des membres de votre équipe.</p>
                </div>
            </div>

            {/* Formulaire d'invitation de membre */}
            <div className="glass-card rounded-3xl p-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Plus className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold dark:text-white text-neutral-900">Inviter un nouveau membre</h2>
                </div>

                <Pattern />
            </div>

            {/* Liste des membres existants (exemple) */}
            <div className="glass-card rounded-3xl p-8 max-w-2xl mx-auto mt-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                        <Users className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold dark:text-white text-neutral-900">Membres actuels</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                        <div>
                            <p className="font-semibold dark:text-white">Admin Utilisateur</p>
                            <p className="text-sm text-neutral-500">admin@exemple.com</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">Admin</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                        <div>
                            <p className="font-semibold dark:text-white">Jean Membre</p>
                            <p className="text-sm text-neutral-500">jean@exemple.com</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-neutral-500/20 text-neutral-500 text-sm font-medium">Member</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Pattern() {
    return (
        <div className="mx-auto w-full max-w-lg">
            <FieldGroup>
                <Field orientation="responsive">
                    <FieldLabel htmlFor="resp-first">First Name</FieldLabel>
                    <Input id="resp-first" placeholder="First name" />
                </Field>
                <Field orientation="responsive">
                    <FieldLabel htmlFor="resp-last">Last Name</FieldLabel>
                    <Input id="resp-last" placeholder="Last name" />
                </Field>
                <Field orientation="responsive">
                    <FieldLabel htmlFor="resp-email">Email</FieldLabel>
                    <Input id="resp-email" type="email" placeholder="you@example.com" />
                </Field>
                <Field orientation="responsive">
                    <FieldLabel htmlFor="resp-role">Role</FieldLabel>
                    <Select defaultValue="member">
                        <SelectTrigger id="resp-role">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <FieldSeparator />
                <FieldDescription>
                    The invited member will receive an email with a link to join.
                </FieldDescription>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button>Send Invite</Button>
                </div>
            </FieldGroup>
        </div>
    )
}