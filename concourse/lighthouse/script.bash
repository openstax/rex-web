#!/usr/bin/env bash
set -euxo pipefail

base_dir=$(pwd)

cd rex-web

yarn install --network-timeout 60000

node script/entry.js lighthouse --pages="$LIGHTHOUSE_PAGES" \
                                --mostRecentReportDir="$base_dir/$LIGHTHOUSE_MOST_RECENT_REPORT_DIR" \
                                --reportDir="$base_dir/$LIGHTHOUSE_REPORT_DIR"
