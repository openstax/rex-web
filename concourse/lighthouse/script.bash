#!/usr/bin/env bash
set -euxo pipefail

cd rex-web

yarn

node script/entry.js lighthouse --pages="$LIGHTHOUSE_PAGES" \
                                --mostRecentReportDir="$LIGHTHOUSE_MOST_RECENT_REPORT_DIR" \
                                --reportDir="$LIGHTHOUSE_REPORT_DIR"
