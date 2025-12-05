import { NextRequest, NextResponse } from 'next/server';

// In production, this would check against a database
const VALID_LICENSES = new Map<string, { email: string; plan: string; activated: boolean }>();

export async function POST(request: NextRequest) {
    try {
        const { licenseKey } = await request.json();

        if (!licenseKey) {
            return NextResponse.json({ valid: false, error: 'No license key provided' });
        }

        // Validate format
        const formatRegex = /^PH-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        if (!formatRegex.test(licenseKey)) {
            return NextResponse.json({ valid: false, error: 'Invalid license format' });
        }

        // Check database (placeholder)
        const license = VALID_LICENSES.get(licenseKey);

        if (!license) {
            // For demo purposes, accept any valid format
            return NextResponse.json({
                valid: true,
                plan: 'pro',
                message: 'License activated successfully',
            });
        }

        return NextResponse.json({
            valid: true,
            plan: license.plan,
            email: license.email,
        });
    } catch (error: any) {
        return NextResponse.json(
            { valid: false, error: error.message },
            { status: 500 }
        );
    }
}
