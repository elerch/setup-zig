{
  description = "Good basic flake template";
  inputs = {
    nixpkgs.url = "nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
     flake-utils.lib.eachDefaultSystem (system:
       let
         systempkgs = nixpkgs.legacyPackages.${system};
       in
       {
         devShells.default = systempkgs.mkShell {
            buildInputs = with systempkgs; [
              # specific nodejs versions available, e.g. nodejs_18
              nodejs_20
              nodePackages.typescript-language-server
            ];
         };
       }
     );
}
