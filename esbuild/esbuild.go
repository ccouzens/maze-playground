package main

import (
	"log"
	"os"
	"os/exec"

	"github.com/evanw/esbuild/pkg/api"
)

func main() {
	cargo := exec.Command("cargo", "build", "--target=wasm32-unknown-unknown", "--release")
	cargo.Stderr = os.Stderr
	cargo.Stdout = os.Stdout
	cargo.Dir = "../computer"
	if err := cargo.Run(); err != nil {
		log.Fatal(err)
	}

	ctx, err := api.Context(api.BuildOptions{
		EntryPoints: []string{"../src/script.ts", "../public/style.css"},
		Loader: map[string]api.Loader{
			".wasm": api.LoaderFile,
			".glsl": api.LoaderFile,
			".wgsl": api.LoaderFile,
		},
		LogLevel:   api.LogLevelInfo,
		Bundle:     true,
		Sourcemap:  api.SourceMapLinked,
		EntryNames: "[name]",
		AssetNames: "[name]",
		Outdir:     "../public/",
		Write:      false,
	})
	if err != nil {
		log.Fatal(err)
	}

	_, err2 := ctx.Serve(api.ServeOptions{
		Servedir: "../public",
	})
	if err2 != nil {
		log.Fatal(err)
	}

	// Returning from main() exits immediately in Go.
	// Block forever so we keep serving and don't exit.
	<-make(chan struct{})
}
