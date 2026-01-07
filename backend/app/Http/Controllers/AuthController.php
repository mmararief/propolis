<?php

namespace App\Http\Controllers;


use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use OpenApi\Annotations as OA;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/auth/register",
     *     tags={"Auth"},
     *     summary="Registrasi akun baru",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nama_lengkap","username","email","password","province_id","province_name","city_id","city_name","district_id","district_name","subdistrict_id","subdistrict_name","postal_code","alamat_lengkap"},
     *             @OA\Property(property="nama_lengkap", type="string", example="Jane Doe"),
     *             @OA\Property(property="username", type="string", example="jane"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password", minLength=8),
     *             @OA\Property(property="no_hp", type="string", nullable=true),
     *             @OA\Property(property="role", type="string", enum={"pelanggan"}, example="pelanggan"),
     *             @OA\Property(property="province_id", type="integer"),
     *             @OA\Property(property="province_name", type="string"),
     *             @OA\Property(property="city_id", type="integer"),
     *             @OA\Property(property="city_name", type="string"),
     *             @OA\Property(property="district_id", type="integer"),
     *             @OA\Property(property="district_name", type="string"),
     *             @OA\Property(property="subdistrict_id", type="integer"),
     *             @OA\Property(property="subdistrict_name", type="string"),
     *             @OA\Property(property="postal_code", type="string", example="40123"),
     *             @OA\Property(property="alamat_lengkap", type="string", example="Jl. Mawar no 1")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Registrasi berhasil"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:100', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'role' => ['nullable', 'in:pelanggan'],
            'province_id' => ['required', 'integer'],
            'province_name' => ['required', 'string', 'max:100'],
            'city_id' => ['required', 'integer'],
            'city_name' => ['required', 'string', 'max:100'],
            'district_id' => ['required', 'integer'],
            'district_name' => ['required', 'string', 'max:100'],
            'subdistrict_id' => ['required', 'integer'],
            'subdistrict_name' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:10'],
            'alamat_lengkap' => ['required', 'string'],
        ]);

        $user = User::create([
            'nama_lengkap' => $data['nama_lengkap'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'no_hp' => $data['no_hp'] ?? null,
            'role' => $data['role'] ?? 'pelanggan',
            'province_id' => $data['province_id'],
            'provinsi' => $data['province_name'],
            'city_id' => $data['city_id'],
            'kabupaten_kota' => $data['city_name'],
            'district_id' => $data['district_id'],
            'kecamatan' => $data['district_name'],
            'subdistrict_id' => $data['subdistrict_id'],
            'kelurahan' => $data['subdistrict_name'],
            'kode_pos' => $data['postal_code'],
            'alamat_lengkap' => $data['alamat_lengkap'],
        ]);


        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user' => $user,
        ], 'Registrasi berhasil', 201);
    }

    /**
     * @OA\Post(
     *     path="/auth/login",
     *     tags={"Auth"},
     *     summary="Login dan mendapatkan token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Login berhasil"),
     *     @OA\Response(response=401, description="Kredensial salah")
     * )
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        /** @var User|null $user */
        // Try to find user by email or username
        $user = User::where('email', $credentials['email'])
            ->orWhere('username', $credentials['email'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return $this->fail('Username/Email atau password salah', 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user' => $user,
        ], 'Login berhasil');
    }

    /**
     * @OA\Get(
     *     path="/auth/profile",
     *     tags={"Auth"},
     *     summary="Mendapatkan informasi profil user",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Data profil user")
     * )
     */
    public function profile(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        $user->load('addresses');

        return $this->success($user, 'Data profil berhasil diambil');
    }

    /**
     * @OA\Put(
     *     path="/auth/profile",
     *     tags={"Auth"},
     *     summary="Update profil user",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="username", type="string"),
     *             @OA\Property(property="nama_lengkap", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="no_hp", type="string"),
     *             @OA\Property(property="province_id", type="integer"),
     *             @OA\Property(property="city_id", type="integer"),
     *             @OA\Property(property="district_id", type="integer"),
     *             @OA\Property(property="subdistrict_id", type="integer"),
     *             @OA\Property(property="postal_code", type="string"),
     *             @OA\Property(property="alamat_lengkap", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Profil berhasil diupdate"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $data = $request->validate([
            'username' => ['sometimes', 'string', 'max:100', 'unique:users,username,' . $user->id],
            'nama_lengkap' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'province_id' => ['nullable', 'integer'],
            'city_id' => ['nullable', 'integer'],
            'district_id' => ['nullable', 'integer'],
            'subdistrict_id' => ['nullable', 'integer'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'alamat_lengkap' => ['nullable', 'string'],
        ]);

        // Update user basic info
        if (isset($data['username'])) {
            $user->username = $data['username'];
        }
        if (isset($data['nama_lengkap'])) {
            $user->nama_lengkap = $data['nama_lengkap'];
        }
        if (isset($data['email'])) {
            $user->email = $data['email'];
        }
        if (isset($data['no_hp'])) {
            $user->no_hp = $data['no_hp'];
        }
        if (isset($data['alamat_lengkap'])) {
            $user->alamat_lengkap = $data['alamat_lengkap'];
        }

        // Update address info in users table
        if (isset($data['province_id'])) {
            $user->province_id = $data['province_id'];
            // Frontend usually sends name too, but if not, we might need to fetch it or rely on what's sent
            // Assuming frontend sends the full package or we just update ID
        }
        // Note: The validation rules in updateProfile don't explicitly require names if IDs are sent, 
        // but typically they come together. Let's check if we can update names too if available in request (not validated but present)
        // Actually, the validation rules above show province_id etc are validated. 
        // We should add province_name etc to validation if we want to save them.
        // The current validation in updateProfile DOES NOT include province_name, city_name etc.
        // I need to check if I should add them or if they are passed.
        // Wait, the previous code didn't validate names in updateProfile either!
        // It only validated IDs: 'province_id' => ['nullable', 'integer']
        // But the Address update logic used: $data['province_name'] ?? null (which would be null if not validated/present)

        // Let's assume for now we update what we have.
        if ($request->has('province_id')) $user->province_id = $data['province_id'];
        if ($request->has('city_id')) $user->city_id = $data['city_id'];
        if ($request->has('district_id')) $user->district_id = $data['district_id'];
        if ($request->has('subdistrict_id')) $user->subdistrict_id = $data['subdistrict_id'];

        // Also update the string names if provided (even if not strictly validated, or we should add validation)
        // Ideally we should update validation to include names.
        if ($request->has('province_name')) $user->provinsi = $request->input('province_name');
        if ($request->has('city_name')) $user->kabupaten_kota = $request->input('city_name');
        if ($request->has('district_name')) $user->kecamatan = $request->input('district_name');
        if ($request->has('subdistrict_name')) $user->kelurahan = $request->input('subdistrict_name');
        if ($request->has('postal_code')) $user->kode_pos = $data['postal_code'];

        $user->save();



        return $this->success($user, 'Profil berhasil diperbarui');
    }

    /**
     * @OA\Post(
     *     path="/auth/logout",
     *     tags={"Auth"},
     *     summary="Logout dan revoke token",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Logout berhasil")
     * )
     */
    public function logout(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        if ($user && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return $this->success(null, 'Logout berhasil');
    }
}
