# bokarn — dashboard

The staff dashboard: reception, booking calendar, inventory and pricing.
Swedish, because its users are reception staff at Swedish campsites and the
domain vocabulary is Swedish.

Part of [bokarn](https://github.com/Mats-Hjalmar/bokarn); run the whole stack
from there with `make dev` rather than starting this on its own.

## Screens

| Route              | What it is                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/reception`       | Today's arrivals, departures and in-house guests. Printable, with check-in and check-out                                                                                             |
| `/kalender`        | Unit × date tape chart. Bookings, held pitches and maintenance blocks are each their own colour, with the guest's name on the stay. Drag across a row to take a pitch out of service |
| `/bokningar`       | Bookings, searchable by reference, surname or email                                                                                                                                  |
| `/bokningar/[id]`  | One booking: the price breakdown exactly as it was frozen at confirmation, what the stay needs from a pitch, and who did what to it                                                  |
| `/platser`         | Every pitch and cabin with the attributes availability filters on                                                                                                                    |
| `/priser`          | Season prices; editing one recompiles the rate calendar immediately                                                                                                                  |
| `/priser/kalender` | What each night costs, and which season set it                                                                                                                                       |
| `/priser/simulera` | "Why this price" — the pricing engine's own step-by-step trace                                                                                                                       |

Reception works from paper when the office wifi drops, so the arrivals list
prints: navigation and action buttons are hidden and the palette inverts.

## Development

```sh
bun install
bun run dev        # http://dashboard.bokarn.localhost
```

Needs the API at `http://api.bokarn.localhost` and the staff identity service
at `http://auth-staff.bokarn.localhost` — `make dev` in the umbrella repo starts
both.

After every change: `bun run format` → `bun run lint` → `bun run typecheck` →
`bun run build`, all clean. See `AGENTS.md` for the conventions this codebase
follows.
