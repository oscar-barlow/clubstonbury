{
  description = "Clubstonbury browser-only club allocation app";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      versions = builtins.fromJSON (builtins.readFile ./versions.json);
      denoVersion = versions.deno.version;
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
          denoTarget = versions.deno.targets.${system};
          deno = pkgs.stdenv.mkDerivation {
            pname = "deno";
            version = denoVersion;
            src = pkgs.fetchurl {
              url = "https://github.com/denoland/deno/releases/download/v${denoVersion}/deno-${denoTarget}.zip";
              sha256 = versions.deno.sha256.${system};
            };
            nativeBuildInputs = [ pkgs.unzip ]
              ++ pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.autoPatchelfHook ];
            buildInputs = pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.stdenv.cc.cc.lib ];
            sourceRoot = ".";
            dontConfigure = true;
            dontBuild = true;
            installPhase = ''
              install -m755 -D deno $out/bin/deno
            '';
          };
        in {
          default = pkgs.mkShell {
            packages = [ deno pkgs.git ];
            shellHook = ''
              export LANG=C.UTF-8
              export LC_ALL=C.UTF-8
            '';
          };
        });
    };
}
