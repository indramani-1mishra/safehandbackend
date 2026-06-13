const AppVersion = require("../modals/AppVersionModel");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Semantic version comparison
// Returns:  -1  if vA < vB
//            0  if vA === vB
//            1  if vA > vB
// Example:  compareVersions("1.9.9", "2.0.0") → -1
// ─────────────────────────────────────────────────────────────────────────────
const compareVersions = (vA, vB) => {
    const partsA = vA.split(".").map(Number);
    const partsB = vB.split(".").map(Number);

    const length = Math.max(partsA.length, partsB.length);

    for (let i = 0; i < length; i++) {
        const numA = partsA[i] ?? 0;
        const numB = partsB[i] ?? 0;

        if (numA < numB) return -1;
        if (numA > numB) return 1;
    }

    return 0; // equal
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC  →  GET /api/app/version-check?platform=android&current_version=1.0.0
// No auth required — app calls this BEFORE login
// ─────────────────────────────────────────────────────────────────────────────
const checkAppVersion = async (req, res) => {
    try {
        const { platform, current_version } = req.query;

        // ── Validate query params ────────────────────────────────────────────
        if (!platform || !current_version) {
            return res.status(400).json({
                success: false,
                message: "Both 'platform' and 'current_version' query parameters are required.",
            });
        }

        const normalizedPlatform = platform.toLowerCase().trim();

        // ── Fetch config from DB ─────────────────────────────────────────────
        const versionConfig = await AppVersion.findOne({ platform: normalizedPlatform });

        if (!versionConfig) {
            return res.status(404).json({
                success: false,
                message: `No version config found for platform: '${normalizedPlatform}'. Please ask the admin to set it up.`,
            });
        }

        // ── Version comparison (semantic) ────────────────────────────────────
        // update_required = true  if current_version < minimum_version
        const updateRequired = compareVersions(current_version, versionConfig.minimum_version) < 0;

        console.log(
            `[VERSION CHECK] platform=${normalizedPlatform} | current=${current_version} | minimum=${versionConfig.minimum_version} | update_required=${updateRequired}`
        );

        // ── Build response ───────────────────────────────────────────────────
        return res.status(200).json({
            update_required: updateRequired,
            latest_version: versionConfig.latest_version,
            minimum_version: versionConfig.minimum_version,
            force_update: versionConfig.force_update,
            play_store_url: versionConfig.play_store_url,
            release_notes: versionConfig.release_notes,
        });

    } catch (error) {
        console.error("[VERSION CHECK] Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during version check.",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN   →  POST /api/admin/app-version
// Protected — requires admin auth token
// Body: { platform, latest_version, minimum_version, force_update, play_store_url, release_notes }
// ─────────────────────────────────────────────────────────────────────────────
const upsertAppVersion = async (req, res) => {
    try {
        const {
            platform,
            latest_version,
            minimum_version,
            force_update,
            play_store_url,
            release_notes,
        } = req.body;

        // ── Validate required fields ─────────────────────────────────────────
        if (!platform || !latest_version || !minimum_version || !play_store_url) {
            return res.status(400).json({
                success: false,
                message: "Required fields: platform, latest_version, minimum_version, play_store_url",
            });
        }

        const normalizedPlatform = platform.toLowerCase().trim();

        // ── Upsert (create or update) ────────────────────────────────────────
        const updatedConfig = await AppVersion.findOneAndUpdate(
            { platform: normalizedPlatform },
            {
                platform: normalizedPlatform,
                latest_version: latest_version.trim(),
                minimum_version: minimum_version.trim(),
                force_update: force_update !== undefined ? force_update : true,
                play_store_url: play_store_url.trim(),
                release_notes: release_notes
                    ? release_notes.trim()
                    : "Please update to the latest version to continue using the app.",
            },
            {
                new: true,       // return updated document
                upsert: true,    // create if not exists
                runValidators: true,
            }
        );

        console.log(
            `[ADMIN VERSION UPDATE] platform=${normalizedPlatform} | latest=${latest_version} | minimum=${minimum_version} | force_update=${force_update}`
        );

        return res.status(200).json({
            success: true,
            message: `App version config for '${normalizedPlatform}' updated successfully.`,
            data: updatedConfig,
        });

    } catch (error) {
        console.error("[ADMIN VERSION UPDATE] Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating version config.",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN   →  GET /api/admin/app-version
// View current version config (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const getAppVersionConfig = async (req, res) => {
    try {
        const configs = await AppVersion.find({}).sort({ platform: 1 });

        return res.status(200).json({
            success: true,
            data: configs,
        });

    } catch (error) {
        console.error("[ADMIN GET VERSION] Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
};

module.exports = {
    checkAppVersion,
    upsertAppVersion,
    getAppVersionConfig,
};
