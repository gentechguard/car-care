"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Ideally valid for server, but using for clientAuth wrapper consistency or use ANON
);

// NOTE: For client-side auth checks, ANON key is standard, but the user's previous setup had mixed keys.
// We will use the standard createClient pattern for client-side usage.
const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabaseClient.auth.getSession();

            if (!session) {
                router.replace('/admin');
                return;
            }

            // Optional: Check if profile is active again (double check)
            const { data: profile, error } = await supabaseClient
                .from('admin_profiles')
                .select('is_active')
                .eq('id', session.user.id)
                .single();

            if (error || !profile?.is_active) {
                await supabaseClient.auth.signOut();
                router.replace('/admin');
                return;
            }

            setAuthorized(true);
            setLoading(false);
        };

        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                router.replace('/admin');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#f8fafc]">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    if (!authorized) return null;

    return <>{children}</>;
}
