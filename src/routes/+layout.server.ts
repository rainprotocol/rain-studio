import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import type { LayoutServerLoad } from './$types';
import type { Organization, Profile } from '$lib/types/app-types';
import type { ContextInfo } from '$lib/types/context-types';

export const load: LayoutServerLoad = async (event) => {
    const { supabaseClient, session } = await getSupabase(event);

    let profile: Profile | null = null;
    let wallets_linked: string[] | null = null;
    let organizations: Organization[] | null = null;
    let userContext: ContextInfo | null = null;

    if (session) {
        const { data: dataWallets } = await supabaseClient
            .from('wallet_users')
            .select(`*, wallets_linked(*)`)
            .eq('id', session.user.id)
            .single();

        if (dataWallets) {
            const { wallets_linked: wallets, ...user } = dataWallets;
            profile = user;
            if (wallets && Array.isArray(wallets))
                wallets_linked = wallets.map((wallet_) => wallet_.address);
        }

        const { data: dataOrgs } = await supabaseClient
            .from('org_member')
            .select(`id, role, info_org: organizations(*)`)
            .eq('user_id', session.user.id);

        if (dataOrgs) {
            organizations = dataOrgs;
        }

        // Making the user context available on all the app (null/undefined or trully data)
        userContext = JSON.parse(event.cookies.get('rain-studio-context'));
    }

    return {
        session,
        profile,
        wallets_linked,
        organizations,
        userContext
    };
};
