package main

import (
	"log"
	"os"
	"os/exec"
	"regexp"
	"strings"

	esbuild "github.com/evanw/esbuild/pkg/api"
)

var esbuildOptions = esbuild.BuildOptions{
	EntryPoints: []string{"../src/script.ts", "../public/style.css"},
	Loader: map[string]esbuild.Loader{
		".wasm": esbuild.LoaderFile,
		".glsl": esbuild.LoaderFile,
		".wgsl": esbuild.LoaderFile,
	},
	LogLevel:  esbuild.LogLevelInfo,
	Bundle:    true,
	Sourcemap: esbuild.SourceMapLinked,
}

func compileRust() {
	cargo := exec.Command("cargo", "build", "--target=wasm32-unknown-unknown", "--release")
	cargo.Stderr = os.Stderr
	cargo.Stdout = os.Stdout
	cargo.Dir = "../computer"
	if err := cargo.Run(); err != nil {
		log.Fatal(err)
	}
}

func build() {
	if err := os.RemoveAll("../build"); err != nil {
		log.Fatal(err)
	}

	buildOutput := esbuild.Build(esbuild.BuildOptions{
		EntryPoints:       esbuildOptions.EntryPoints,
		Loader:            esbuildOptions.Loader,
		LogLevel:          esbuildOptions.LogLevel,
		Bundle:            esbuildOptions.Bundle,
		Sourcemap:         esbuildOptions.Sourcemap,
		EntryNames:        "[name]-[hash]",
		AssetNames:        "[name]-[hash]",
		MinifyWhitespace:  true,
		MinifyIdentifiers: true,
		MinifySyntax:      true,
		Outdir:            "../build/",
		Write:             true,
	})

	for _, err := range buildOutput.Errors {
		log.Println(err)
	}
	for _, warning := range buildOutput.Warnings {
		log.Println(warning)
	}
	if len(buildOutput.Errors) != 0 {
		log.Fatal()
	}

	fileNameExtractor := regexp.MustCompile("/build/([^-]+)(-[A-Z0-9]{8})(\\..+)")
	for _, fileName := range []string{"rendering-playground.html"} {
		file, err := os.ReadFile("../public/" + fileName)
		if err != nil {
			log.Fatal(err)
		}
		html := string(file)

		for _, outFile := range buildOutput.OutputFiles {
			matches := fileNameExtractor.FindStringSubmatch(outFile.Path)
			name := matches[1]
			hash := matches[2]
			ext := matches[3]
			html = strings.ReplaceAll(html, name+ext, name+hash+ext)
		}

		if err := os.WriteFile("../build/"+fileName, []byte(html), 0444); err != nil {
			log.Fatal(err)
		}
	}
}

func serve() {
	ctx, err := esbuild.Context(esbuild.BuildOptions{
		EntryPoints: esbuildOptions.EntryPoints,
		Loader:      esbuildOptions.Loader,
		LogLevel:    esbuildOptions.LogLevel,
		Bundle:      esbuildOptions.Bundle,
		Sourcemap:   esbuildOptions.Sourcemap,
		EntryNames:  "[name]",
		AssetNames:  "[name]",
		Outdir:      "../public/",
		Write:       false,
	})
	if err != nil {
		log.Fatal(err)
	}

	_, err2 := ctx.Serve(esbuild.ServeOptions{
		Servedir: "../public",
	})
	if err2 != nil {
		log.Fatal(err)
	}

	// Returning from main() exits immediately in Go.
	// Block forever so we keep serving and don't exit.
	<-make(chan struct{})
}

func main() {
	compileRust()

	if len(os.Args) >= 2 && os.Args[1] == "serve" {
		serve()
	} else {
		build()
	}
}
