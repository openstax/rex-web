#!/usr/bin/env bash
# spell-checker: ignore pipefail newkey outform keyout extfile
set -euo pipefail; if [ -n "${DEBUG-}" ]; then set -x; fi

project_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
shared_certificate_dir=~/.openstax/certs

mkdir -p "$project_dir/data/certs"
mkdir -p "$shared_certificate_dir"
cd "$project_dir/data/certs"

host=${HOST:-localhost}

# links about this logic
#  - https://stackoverflow.com/questions/43929436/subject-alternative-name-missing-err-ssl-version-or-cipher-mismatch
#  - https://stackoverflow.com/questions/64597721/neterr-cert-validity-too-long-the-server-certificate-has-a-validity-period-t
#  - https://devopscube.com/create-self-signed-certificates-openssl/

if [ ! -f "$shared_certificate_dir/CA.cer" ] || [ ! -f "$shared_certificate_dir/CA.pvk" ]; then
  echo "creating self signed authority"
  cat << EOF > "$shared_certificate_dir/cert.cfn"
[ req ]
distinguished_name = req_distinguished_name
x509_extensions = root_ca

[ req_distinguished_name ]
commonName = openstax.local

[ root_ca ]
basicConstraints = critical, CA:true
EOF
  openssl req -x509 -sha256 -days 356 -nodes -newkey rsa:2048 -config "$shared_certificate_dir/cert.cfn" -subj "/CN=Openstax.local" \
    -keyout "$shared_certificate_dir/CA.pvk" -out "$shared_certificate_dir/CA.cer" 
fi

if [ ! -f "$host.pvk" ] || [ ! -f "$host.cer" ]; then
  cat << EOF > "$project_dir/data/certs/$host.ext"
subjectAltName = @alt_names
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = $host
EOF
  openssl req -newkey rsa:2048 -keyout "$host.pvk" -out "$host.req" -subj /CN="$host" -sha256 -nodes
  openssl x509 -req -CA "$shared_certificate_dir"/CA.cer -CAkey "$shared_certificate_dir"/CA.pvk -in "$host.req" -out "$host.cer" -days 397 -extfile "$host.ext" -sha256 -set_serial 0x1111
fi
