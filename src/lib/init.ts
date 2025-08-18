
declare const BUILD_TIME: string
declare const ENV: string
/**
 * Initialize script info and logging.
 * @param options Logging options.
 * @param options.LOGGING_ENABLED Enable/disable logging (default: true)
 * @returns Script info and logging functions
 */
export function init({ LOGGING_ENABLED = ENV === "dev" ? true : false } = {}): {
	/** Full script name from \@name */
	SCRIPT_NAME: string
	/** Short name from downloadURL filename */
	SCRIPT_SHORTNAME: string
	/** Script version */
	SCRIPT_VERSION: string
	/** Console log wrapper */
	log: (...args: any[]) => void
	/** Console warn wrapper */
	logWarn: (...args: any[]) => void
	/** Console error wrapper */
	logError: (...args: any[]) => void
} {
	const SCRIPT_NAME = GM_info.script.name
	const SCRIPT_SHORTNAME = GM_info.script.downloadURL!.split("/").slice(-1)[0].split(".").slice(0, -2).join(".").trim() || SCRIPT_NAME.replace(" ", "").trim()
	const SCRIPT_VERSION = GM_info.script.version

	const LOG_PREFIX = `[${SCRIPT_SHORTNAME}]`
	const log = (...args: any[]) => LOGGING_ENABLED && console.log(LOG_PREFIX, ...args)
	const logWarn = (...args: any[]) => console.warn(LOG_PREFIX, ...args)
	const logError = (...args: any[]) => console.error(LOG_PREFIX, ...args)

	console.log(`[${SCRIPT_SHORTNAME}] ${SCRIPT_NAME} v${SCRIPT_VERSION} by iamasink loaded`)
	// console.log(`[${SCRIPT_SHORTNAME}] built @${BUILD_TIME}`)

	return { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logWarn, logError }
}
