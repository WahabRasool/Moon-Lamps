"use strict";
console.clear();
import * as THREE from "three";
import { OrbitControls as e } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader as t } from "three/addons/loaders/GLTFLoader.js";
async function n() {
  if ("Ammo" in window == !1)
    return void console.error("AmmoPhysics: Couldn't find Ammo.js");
  const e = await Ammo(),
    t = new e.btDefaultCollisionConfiguration(),
    n = new e.btCollisionDispatcher(t),
    i = new e.btDbvtBroadphase(),
    a = new e.btSequentialImpulseConstraintSolver(),
    r = new e.btDiscreteDynamicsWorld(n, i, a, t);
  r.setGravity(new e.btVector3(0, -10, 0));
  let s = new e.btTransform();
  const l = new e.btTransform();
  let c,
    d = new e.btVector3(0, 0, 0),
    h = new e.btQuaternion(0, 0, 0, 0);
  function m(e) {
    let t = null;
    d.setValue(0, 0, 0);
    let n = e.attributes.position.array;
    t = new Ammo.btConvexHullShape();
    for (let e = 0, o = n.length; e < o; e += 3) {
      d.setValue(n[e], n[e + 1], n[e + 2]);
      const i = e >= o - 3;
      t.addPoint(d, i);
    }
    return (
      t && t.setMargin(0), t || console.error("AmmoPhysics: Shape error."), t
    );
  }
  let w = [],
    E = new WeakMap();
  let u = null,
    p = "";
  function g(t, n, o, i = null) {
    (c = t.position),
      (h = t.quaternion),
      s.setIdentity(),
      d.setValue(c.x, c.y, c.z),
      s.setOrigin(d),
      s.setRotation(new e.btQuaternion(h.x, h.y, h.z, h.w));
    const a = t.scale;
    d.setValue(a.x, a.y, a.z), o.setLocalScaling(d), d.setValue(0, 0, 0);
    const l = new e.btDefaultMotionState(s),
      m = d;
    n > 0 && o.calculateLocalInertia(n, m);
    const u = new e.btRigidBodyConstructionInfo(n, l, o, m),
      p = new e.btRigidBody(u);
    "pointLight" == t.name
      ? (p.setFriction(0.1), p.setRestitution(0.7))
      : "floor" == t.name
      ? (p.setFriction(1), p.setRestitution(1), p.setDamping(0, 0))
      : (p.setFriction(0.5), p.setRestitution(0.3), p.setDamping(0, 0)),
      "shootingBall" == t.name &&
        i &&
        (d.setValue(i.x, i.y, i.z), p.setLinearVelocity(d)),
      (p.name = t.name),
      r.addRigidBody(p),
      n > 0 && (w.push(t), E.set(t, p));
  }
  let M = 0;
  return (
    setInterval(function () {
      const e = performance.now();
      if (M > 0) {
        const t = (e - M) / 1e3;
        r.stepSimulation(t, 10);
      }
      M = e;
      for (let e = 0, t = w.length; e < t; e++) {
        if (!w[e]) continue;
        let t = w[e];
        if (t.isInstancedMesh) {
          let e = t.instanceMatrix.array;
          if (!E.has(t)) continue;
          let n = E.get(t);
          for (let t = 0; t < n.length; t++)
            n[t] &&
              (n[t].getMotionState().getWorldTransform(l),
              (c = l.getOrigin()),
              (h = l.getRotation()),
              o(c, h, e, 16 * t));
          E.set(t, n), (t.instanceMatrix.needsUpdate = !0);
        } else if (t.isMesh) {
          if (!E.has(t)) continue;
          E.get(t).getMotionState().getWorldTransform(l),
            (c = l.getOrigin()),
            (h = l.getRotation()),
            t.position.set(c.x(), c.y(), c.z()),
            t.quaternion.set(h.x(), h.y(), h.z(), h.w());
        }
      }
    }, 1e3 / 60),
    {
      addMesh: function (e, t = 0) {
        const n = m(e.geometry);
        if (!n) return console.error("AmmoPhysics: Shape is NULL."), !1;
        g(e, t, n);
      },
      addTerrainMesh: function (e, t = 0) {
        const n = (function (e) {
          let t,
            n = e.attributes.position.array,
            o = e.index.array,
            i = new Ammo.btTriangleMesh();
          for (let e = 0; e < o.length; e += 3) {
            let t = new Ammo.btVector3(
                n[3 * o[e]],
                n[3 * o[e] + 1],
                n[3 * o[e] + 2]
              ),
              a = new Ammo.btVector3(
                n[3 * o[e + 1]],
                n[3 * o[e + 1] + 1],
                n[3 * o[e + 1] + 2]
              ),
              r = new Ammo.btVector3(
                n[3 * o[e + 2]],
                n[3 * o[e + 2] + 1],
                n[3 * o[e + 2] + 2]
              );
            i.addTriangle(t, a, r);
          }
          return (
            (t = new Ammo.btBvhTriangleMeshShape(i, !0, !0)) && t.setMargin(0),
            t || console.error("AmmoPhysics: Shape error."),
            t
          );
        })(e.geometry);
        if (!n) return console.error("AmmoPhysics: Shape is NULL."), !1;
        g(e, 0, n);
      },
      addShootingMesh: function (e, t = 0, n = null) {
        return n
          ? ((!e.name || (e.name && e.name != p)) &&
              ((u = m(e.geometry)), (p = e.name)),
            u
              ? void g(e, t, u, n)
              : (console.error("AmmoPhysics: Shape is NULL."), !1))
          : (console.error("AmmoPhysics: Parameter is NULL."), !1);
      }
    }
  );
}
function o(e, t, n, o) {
  const i = t.x(),
    a = t.y(),
    r = t.z(),
    s = t.w(),
    l = i + i,
    c = a + a,
    d = r + r,
    h = i * l,
    m = i * c,
    w = i * d,
    E = a * c,
    u = a * d,
    p = r * d,
    g = s * l,
    M = s * c,
    y = s * d;
  (n[o + 0] = 1 - (E + p)),
    (n[o + 1] = m + y),
    (n[o + 2] = w - M),
    (n[o + 3] = 0),
    (n[o + 4] = m - y),
    (n[o + 5] = 1 - (h + p)),
    (n[o + 6] = u + g),
    (n[o + 7] = 0),
    (n[o + 8] = w + M),
    (n[o + 9] = u - g),
    (n[o + 10] = 1 - (h + E)),
    (n[o + 11] = 0),
    (n[o + 12] = e.x()),
    (n[o + 13] = e.y()),
    (n[o + 14] = e.z()),
    (n[o + 15] = 1);
}
!(function () {
  let o,
    i,
    a,
    r,
    s,
    l,
    c,
    d,
    h,
    m,
    w,
    E,
    u,
    p,
    g,
    M = 5,
    y = 20,
    R = "";
  new THREE.Object3D();
  const T = new THREE.TextureLoader();
  (h = new THREE.CubeTextureLoader()).setCrossOrigin(""),
    h.setPath("https://threejs.org/examples/textures/cube/pisa/"),
    h.load(
      ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
      function (h) {
        (u = h),
          T.load(
            "https://happy358.github.io/Images/textures/lunar_color.jpg",
            function (h) {
              ((p = h).anisotropy = 16),
                new t().load(
                  "https://raw.githubusercontent.com/happy358/misc/main/model/chair/ArmChair.gltf",
                  function (t) {
                    (g = t),
                      (async function () {
                        o = await n();
                        const t = document.createElement("div");
                        document.body.appendChild(t),
                          ((a = new THREE.Scene()).background = 0),
                          (r = new THREE.WebGLRenderer({
                            antialias: !0
                          })).setPixelRatio(
                            Math.min(window.devicePixelRatio, 2)
                          ),
                          r.setSize(window.innerWidth, window.innerHeight),
                          (r.shadowMap.enabled = !0),
                          t.appendChild(r.domElement),
                          (i = new THREE.PerspectiveCamera(
                            35,
                            window.innerWidth / window.innerHeight,
                            0.01,
                            5 * y
                          )).position.set(0, 3, 18),
                          i.lookAt(0, 0, 0),
                          ((s = new e(i, r.domElement)).autoRotate = !1),
                          (s.autoRotateSpeed = 2),
                          (s.enableDamping = !0),
                          (s.enablePan = !1),
                          (s.minDistance = 3),
                          (s.maxDistance = y),
                          (s.minPolarAngle = 0),
                          (s.maxPolarAngle = (Math.PI / 2) * 0.9),
                          s.target.set(0, M, 0),
                          (s.coupleCenters = !0),
                          s.update();
                        const h = new THREE.AmbientLight(16777215, 0.5);
                        a.add(h),
                          (m = 40),
                          (R = "white"),
                          ((w = new THREE.PointLight(
                            R,
                            40,
                            10
                          )).castShadow = !0),
                          (w.shadow.bias = -0.01),
                          (l = new THREE.SphereGeometry(2, 30, 30)),
                          (c = new THREE.MeshBasicMaterial({
                            color: R
                          })).color.multiplyScalar(3),
                          (E = new THREE.Mesh(l, c)).position.set(0, 1, 0),
                          (E.name = "pointLight"),
                          E.add(w),
                          E.add(
                            new THREE.Mesh(
                              l,
                              new THREE.MeshLambertMaterial({
                                color: "white",
                                transparent: !0,
                                opacity: 0.3
                              })
                            )
                          ),
                          E.children[1].scale.set(1.02, 1.02, 1.02),
                          E.add(
                            new THREE.Mesh(
                              l,
                              new THREE.MeshBasicMaterial({
                                color: "white",
                                transparent: !0,
                                opacity: 0.05
                              })
                            )
                          ),
                          E.children[2].scale.set(1.05, 1.05, 1.05);
                        for (let e = 0; e < 5; e++)
                          (E = E.clone()),
                            (R = new THREE.Color("#faf0e6")),
                            (c = new THREE.MeshPhongMaterial({
                              color: R,
                              map: p,
                              lightMap: p,
                              lightMapIntensity: 3
                            })),
                            (E.material = c),
                            E.children[0].color.set(R),
                            0 == e
                              ? E.position.set(0, 2 * M, 0)
                              : (E.position.set(
                                  THREE.MathUtils.randInt(2 * -M, 2 * M),
                                  THREE.MathUtils.randFloat(1.5 * M, 4.0 * M),
                                  THREE.MathUtils.randInt(2 * -M, 1.3 * M)
                                ),
                                E.rotation.set(
                                  THREE.MathUtils.randFloat(
                                    2 * -Math.PI,
                                    2 * Math.PI
                                  ),
                                  THREE.MathUtils.randFloat(
                                    2 * -Math.PI,
                                    2 * Math.PI
                                  ),
                                  THREE.MathUtils.randFloat(
                                    2 * -Math.PI,
                                    2 * Math.PI
                                  )
                                )),
                            a.add(E),
                            o.addMesh(E, 0.5);
                        (function () {
                          (l = new THREE.IcosahedronGeometry(0.8, 1)),
                            (c = new THREE.MeshPhongMaterial({
                              envMap: u,
                              flatShading: !0
                            }));
                          const e = new THREE.Mesh(l, c);
                          (e.castShadow = !0),
                            (e.name = "shootingBall"),
                            window.addEventListener(
                              "pointerdown",
                              function (t) {
                                S.set(
                                  (t.clientX / window.innerWidth) * 2 - 1,
                                  (-t.clientY / window.innerHeight) * 2 + 1
                                ),
                                  i.updateMatrixWorld(),
                                  b.setFromCamera(S, i),
                                  P.copy(b.ray.direction),
                                  P.add(b.ray.origin),
                                  (d = e.clone()).position.set(P.x, P.y, P.z),
                                  (d.material = d.material.clone()),
                                  (R = new THREE.Color()).setHSL(
                                    Math.abs(
                                      THREE.MathUtils.randInt(-1e3, 1e3) / 1e3
                                    ),
                                    1,
                                    THREE.MathUtils.randInt(500, 700) / 1e3
                                  ),
                                  d.material.color.set(R),
                                  a.add(d),
                                  P.copy(b.ray.direction),
                                  P.multiplyScalar(H),
                                  o.addShootingMesh(d, f, P);
                              }
                            );
                        })(),
                          (l = new THREE.CylinderGeometry(
                            y,
                            y,
                            4 * y,
                            32,
                            1,
                            !1
                          )),
                          (c = new THREE.MeshPhongMaterial({
                            color: 5592405,
                            shininess: 10,
                            specular: 1118481,
                            side: THREE.DoubleSide
                          }));
                        let T = new THREE.Mesh(l, c);
                        (T.receiveShadow = !0),
                          (T.name = "wall"),
                          a.add(T),
                          o.addTerrainMesh(T, 0),
                          (l = new THREE.CircleGeometry(1.5 * y, 8)).rotateX(
                            -Math.PI / 2
                          );
                        let A = new THREE.Mesh(l, c);
                        (A.receiveShadow = !0),
                          (A.name = "floor"),
                          a.add(A),
                          o.addTerrainMesh(A, 0);
                        (l = g.scene.children[0].geometry),
                          (c = g.scene.children[0].material),
                          (g = new THREE.Mesh(l, c)).scale.set(10, 10, 10),
                          g.position.set(0, 0, 0),
                          (g.castShadow = !0),
                          (g.receiveShadow = !0),
                          (g.name = "chair"),
                          a.add(g),
                          o.addTerrainMesh(g, 0),
                          L(),
                          window.addEventListener("resize", x);
                      })();
                  }
                );
            }
          );
      }
    );
  let f = 10,
    H = 35;
  const b = new THREE.Raycaster(),
    S = new THREE.Vector2(),
    P = new THREE.Vector3();
  function x() {
    (i.aspect = window.innerWidth / window.innerHeight),
      i.updateProjectionMatrix(),
      r.setSize(window.innerWidth, window.innerHeight);
  }
  function L() {
    requestAnimationFrame(L), s.update(), r.render(a, i);
  }
})();
export { n as AmmoPhysics };
