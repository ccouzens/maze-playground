(() => {
  "use strict";
  async function e(e, t, r) {
    const a = await fetch(r);
    if (!a.ok) throw `Unexpected response ${a.status} ${a.statusText}`;
    const n = await a.text(),
      o = e.createShader(t);
    if (
      (e.shaderSource(o, n),
      e.compileShader(o),
      e.getShaderParameter(o, e.COMPILE_STATUS))
    )
      return o;
    throw (
      (console.error(e.getShaderInfoLog(o)),
      e.deleteShader(o),
      `Could not compile shader ${r}`)
    );
  }
  async function t(t, r) {
    const a = document.querySelector("#webgl2"),
      n = a?.getContext("webgl2");
    if (!n) return;
    const [o, i] = await Promise.all([
        e(n, n.FRAGMENT_SHADER, "./frag-LATEST.glsl"),
        e(n, n.VERTEX_SHADER, "./vert-LATEST.glsl"),
      ]),
      s = n.createProgram();
    if (
      (n.attachShader(s, i),
      n.attachShader(s, o),
      n.linkProgram(s),
      !n.getProgramParameter(s, n.LINK_STATUS))
    )
      throw (
        (console.error(n.getProgramInfoLog(s)),
        n.deleteProgram(s),
        "Could not compile program")
      );
    const c = n.getAttribLocation(s, "a_position"),
      l = n.getUniformLocation(s, "u_dimensions"),
      u = n.getUniformLocation(s, "u_pixel_dimensions"),
      m = n.getUniformLocation(s, "u_wall_size"),
      d = n.getUniformLocation(s, "u_passage_size"),
      g = n.getUniformLocation(s, "u_walls"),
      f = (function (e, t) {
        const r = e.maze_walls_ptr(t),
          a = e.maze_walls_length(t);
        return new Uint8Array(e.memory.buffer, r, a);
      })(t, r),
      T = n.createBuffer();
    n.bindBuffer(n.ARRAY_BUFFER, T),
      n.bufferData(
        n.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]),
        n.STATIC_DRAW,
      );
    const _ = n.createVertexArray();
    n.bindVertexArray(_),
      n.enableVertexAttribArray(c),
      n.vertexAttribPointer(c, 2, n.FLOAT, !1, 0, 0);
    const E = [t.maze_width(r), t.maze_height(r)],
      h = n.createTexture();
    n.activeTexture(n.TEXTURE0 + 0),
      n.bindTexture(n.TEXTURE_2D, h),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.NEAREST),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.NEAREST),
      n.texImage2D(
        n.TEXTURE_2D,
        0,
        n.R8,
        f.length,
        1,
        0,
        n.RED,
        n.UNSIGNED_BYTE,
        f,
      );
    const w = [4 * E[0] + 1, 4 * E[1] + 1];
    n.useProgram(s),
      n.uniform2ui(l, E[0], E[1]),
      n.uniform1f(m, 1),
      n.uniform1f(d, 3),
      n.uniform2f(u, w[0], w[1]),
      n.uniform1i(g, 0),
      (n.canvas.width = 4 * E[0] + 1),
      (n.canvas.height = 4 * E[1] + 1),
      n.viewport(0, 0, n.canvas.width, n.canvas.height),
      n.bindVertexArray(_),
      n.drawArrays(n.TRIANGLE_STRIP, 0, 4),
      a?.classList.add("canvas-ready");
  }
  async function r(e, t) {
    const r = await navigator.gpu
      ?.requestAdapter()
      .then((e) => e?.requestDevice());
    if (void 0 === r) return void console.log("WebGPU is not supported");
    const a = document.querySelector("#webgpu"),
      n = a?.getContext("webgpu");
    if (!n) return void console.log("WebGPU is not supported");
    const o = navigator.gpu.getPreferredCanvasFormat();
    n.configure({ device: r, format: o }),
      (n.canvas.width = 41),
      (n.canvas.height = 41);
    const i = await fetch("./shader-LATEST.wgsl").then((e) => e.text()),
      s = r.createShaderModule({ label: "shader from example", code: i }),
      c = await r.createRenderPipelineAsync({
        label: "example pipeline",
        layout: "auto",
        primitive: { topology: "triangle-strip" },
        vertex: { module: s, entryPoint: "vs" },
        fragment: { module: s, entryPoint: "fs", targets: [{ format: o }] },
      });
    !(function (e, t, r) {
      const a = t.createCommandEncoder({ label: "our encoder" }),
        n = a.beginRenderPass({
          label: "our basic canvas renderPass",
          colorAttachments: [
            {
              view: e.getCurrentTexture().createView(),
              clearValue: [0.3, 0.3, 0.3, 1],
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
      n.setPipeline(r), n.draw(4), n.end();
      const o = a.finish();
      t.queue.submit([o]);
    })(n, r, c),
      a?.classList.add("canvas-ready");
  }
  function a(e, t) {
    const r = document.querySelector("#svg");
    r.setAttribute(
      "viewBox",
      `-1 -1 ${e.maze_width(t) + 2} ${e.maze_height(t) + 2}`,
    );
    const a = document.createElementNS("http://www.w3.org/2000/svg", "path");
    a.setAttribute(
      "d",
      (function (e, t) {
        try {
          const r = e.string_ptr(t),
            a = e.string_length(t),
            n = new Uint8Array(e.memory.buffer, r, a);
          return new TextDecoder().decode(n);
        } finally {
          e.free_string(t);
        }
      })(e, e.maze_svg_path(t)),
    ),
      r.append(a);
  }
  (async function () {
    const e = await (async function () {
        let e;
        const t = await WebAssembly.instantiateStreaming(
          fetch("./computer-LATEST.wasm"),
          {
            random: {
              fill_bytes(t, r) {
                const a = new Uint8Array(e.memory.buffer, t, r);
                crypto.getRandomValues(a);
              },
            },
          },
        );
        return (e = t.instance.exports), e;
      })(),
      n = e.new_maze(10, 10);
    try {
      await Promise.all([r(), t(e, n), a(e, n)]);
    } finally {
      e.free_maze(n);
    }
  })().catch((e) => {
    console.error("Error putting maze on page", e);
  });
})();
