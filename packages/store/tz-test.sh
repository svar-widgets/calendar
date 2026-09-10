#!/bin/bash
# Recurrence is expanded in local calendar terms, so its specs have to hold in
# every timezone - including ones where the local date differs from the UTC
# date, and ones that cross a daylight saving change mid-series.
#
# Runs the recurrence and iCal specs across a spread of offsets. Source-level
# only: no package build is needed.
set -e

ZONES=${ZONES:-"UTC Europe/Warsaw America/New_York Pacific/Auckland Pacific/Honolulu Asia/Kathmandu"}

STORE_SPECS="test/pro_rrule.spec.ts test/pro_rrule_parse.spec.ts \
	test/pro_recurring.spec.ts test/pro_features/recurring_actions.spec.ts"

for zone in $ZONES; do
	echo "== $zone"
	(TZ="$zone" vp test $STORE_SPECS)
done
