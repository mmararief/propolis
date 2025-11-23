<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use OpenApi\Annotations as OA;

class AdminUserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/users",
     *     tags={"Admin"},
     *     summary="Daftar semua users",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="role", in="query", @OA\Schema(type="string", enum={"admin", "pelanggan"})),
     *     @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Daftar users")
     * )
     */
    public function index(Request $request)
    {
        $this->authorize('admin');

        $users = User::withCount('orders')
            ->when($request->filled('role'), fn($q) => $q->where('role', $request->string('role')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search');
                $q->where(function ($query) use ($search) {
                    $query->where('nama_lengkap', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return $this->success($users);
    }

    /**
     * @OA\Get(
     *     path="/admin/users/{id}",
     *     tags={"Admin"},
     *     summary="Detail user",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detail user"),
     *     @OA\Response(response=404, description="User tidak ditemukan")
     * )
     */
    public function show(int $id)
    {
        $this->authorize('admin');

        $user = User::with(['orders' => function ($q) {
            $q->latest()->limit(10);
        }])->withCount('orders')->findOrFail($id);

        return $this->success($user);
    }

    /**
     * @OA\Post(
     *     path="/admin/users",
     *     tags={"Admin"},
     *     summary="Buat user baru",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nama_lengkap","username","email","password"},
     *             @OA\Property(property="nama_lengkap", type="string", example="John Doe"),
     *             @OA\Property(property="username", type="string", example="johndoe"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password", minLength=8),
     *             @OA\Property(property="no_hp", type="string", nullable=true),
     *             @OA\Property(property="role", type="string", enum={"admin","pelanggan"}, example="pelanggan"),
     *             @OA\Property(property="province_id", type="integer", nullable=true),
     *             @OA\Property(property="province_name", type="string", nullable=true),
     *             @OA\Property(property="city_id", type="integer", nullable=true),
     *             @OA\Property(property="city_name", type="string", nullable=true),
     *             @OA\Property(property="district_id", type="integer", nullable=true),
     *             @OA\Property(property="district_name", type="string", nullable=true),
     *             @OA\Property(property="subdistrict_id", type="integer", nullable=true),
     *             @OA\Property(property="subdistrict_name", type="string", nullable=true),
     *             @OA\Property(property="postal_code", type="string", nullable=true),
     *             @OA\Property(property="alamat_lengkap", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="User berhasil dibuat"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function store(Request $request)
    {
        $this->authorize('admin');

        $data = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:100', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'role' => ['nullable', 'in:admin,pelanggan'],
            'province_id' => ['nullable', 'integer'],
            'province_name' => ['nullable', 'string', 'max:100'],
            'city_id' => ['nullable', 'integer'],
            'city_name' => ['nullable', 'string', 'max:100'],
            'district_id' => ['nullable', 'integer'],
            'district_name' => ['nullable', 'string', 'max:100'],
            'subdistrict_id' => ['nullable', 'integer'],
            'subdistrict_name' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'alamat_lengkap' => ['nullable', 'string'],
        ]);

        $user = User::create([
            'nama_lengkap' => $data['nama_lengkap'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'no_hp' => $data['no_hp'] ?? null,
            'role' => $data['role'] ?? 'pelanggan',
            'province_id' => $data['province_id'] ?? null,
            'provinsi' => $data['province_name'] ?? null,
            'city_id' => $data['city_id'] ?? null,
            'kabupaten_kota' => $data['city_name'] ?? null,
            'district_id' => $data['district_id'] ?? null,
            'kecamatan' => $data['district_name'] ?? null,
            'subdistrict_id' => $data['subdistrict_id'] ?? null,
            'kelurahan' => $data['subdistrict_name'] ?? null,
            'kode_pos' => $data['postal_code'] ?? null,
            'alamat_lengkap' => $data['alamat_lengkap'] ?? null,
        ]);



        return $this->success($user, 'User berhasil dibuat', 201);
    }

    /**
     * @OA\Put(
     *     path="/admin/users/{id}",
     *     tags={"Admin"},
     *     summary="Update user",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nama_lengkap", type="string"),
     *             @OA\Property(property="username", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password", minLength=8),
     *             @OA\Property(property="no_hp", type="string", nullable=true),
     *             @OA\Property(property="role", type="string", enum={"admin","pelanggan"}),
     *             @OA\Property(property="province_id", type="integer", nullable=true),
     *             @OA\Property(property="province_name", type="string", nullable=true),
     *             @OA\Property(property="city_id", type="integer", nullable=true),
     *             @OA\Property(property="city_name", type="string", nullable=true),
     *             @OA\Property(property="district_id", type="integer", nullable=true),
     *             @OA\Property(property="district_name", type="string", nullable=true),
     *             @OA\Property(property="subdistrict_id", type="integer", nullable=true),
     *             @OA\Property(property="subdistrict_name", type="string", nullable=true),
     *             @OA\Property(property="postal_code", type="string", nullable=true),
     *             @OA\Property(property="alamat_lengkap", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="User berhasil diupdate"),
     *     @OA\Response(response=404, description="User tidak ditemukan"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function update(Request $request, int $id)
    {
        $this->authorize('admin');

        $user = User::findOrFail($id);

        $data = $request->validate([
            'nama_lengkap' => ['sometimes', 'string', 'max:255'],
            'username' => ['sometimes', 'string', 'max:100', 'unique:users,username,' . $id],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $id],
            'password' => ['sometimes', Password::min(8)],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'role' => ['sometimes', 'in:admin,pelanggan'],
            'province_id' => ['nullable', 'integer'],
            'province_name' => ['nullable', 'string', 'max:100'],
            'city_id' => ['nullable', 'integer'],
            'city_name' => ['nullable', 'string', 'max:100'],
            'district_id' => ['nullable', 'integer'],
            'district_name' => ['nullable', 'string', 'max:100'],
            'subdistrict_id' => ['nullable', 'integer'],
            'subdistrict_name' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'alamat_lengkap' => ['nullable', 'string'],
        ]);

        // Update user basic info
        if (isset($data['nama_lengkap'])) {
            $user->nama_lengkap = $data['nama_lengkap'];
        }
        if (isset($data['username'])) {
            $user->username = $data['username'];
        }
        if (isset($data['email'])) {
            $user->email = $data['email'];
        }
        if (isset($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        if (isset($data['no_hp'])) {
            $user->no_hp = $data['no_hp'];
        }
        if (isset($data['role'])) {
            $user->role = $data['role'];
        }
        if (isset($data['alamat_lengkap'])) {
            $user->alamat_lengkap = $data['alamat_lengkap'];
        }
        if (isset($data['province_name'])) {
            $user->provinsi = $data['province_name'];
        }
        if (isset($data['city_name'])) {
            $user->kabupaten_kota = $data['city_name'];
        }
        if (isset($data['district_name'])) {
            $user->kecamatan = $data['district_name'];
        }
        if (isset($data['subdistrict_name'])) {
            $user->kelurahan = $data['subdistrict_name'];
        }
        if (isset($data['postal_code'])) {
            $user->kode_pos = $data['postal_code'];
        }

        // Update new ID columns
        if (isset($data['province_id'])) {
            $user->province_id = $data['province_id'];
        }
        if (isset($data['city_id'])) {
            $user->city_id = $data['city_id'];
        }
        if (isset($data['district_id'])) {
            $user->district_id = $data['district_id'];
        }
        if (isset($data['subdistrict_id'])) {
            $user->subdistrict_id = $data['subdistrict_id'];
        }

        $user->save();



        return $this->success($user, 'User berhasil diperbarui');
    }

    /**
     * @OA\Delete(
     *     path="/admin/users/{id}",
     *     tags={"Admin"},
     *     summary="Hapus user",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="User berhasil dihapus"),
     *     @OA\Response(response=404, description="User tidak ditemukan"),
     *     @OA\Response(response=422, description="User tidak dapat dihapus karena memiliki pesanan")
     * )
     */
    public function destroy(int $id)
    {
        $this->authorize('admin');

        $user = User::withCount('orders')->findOrFail($id);

        // Cegah hapus user yang memiliki pesanan
        if ($user->orders_count > 0) {
            return $this->fail('User tidak dapat dihapus karena memiliki ' . $user->orders_count . ' pesanan. Gunakan status nonaktif atau hapus pesanan terlebih dahulu.', 422);
        }

        // Cegah hapus user admin (safety check)
        if ($user->isAdmin() && User::where('role', 'admin')->count() <= 1) {
            return $this->fail('Tidak dapat menghapus user admin terakhir', 422);
        }

        $user->delete();

        return $this->success(null, 'User berhasil dihapus');
    }
}
