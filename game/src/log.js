// log.js — the turn log. One job: keep the readable history the table shows.
export const LOG_LIMIT = 9;

/** Append a line; oldest lines fall off the top. */
export function addLog(state, text) {
  state.log.push(text);
  if (state.log.length > LOG_LIMIT) state.log.splice(0, state.log.length - LOG_LIMIT);
}
