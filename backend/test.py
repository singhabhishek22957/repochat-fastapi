import asyncio
import time
from datetime import datetime

import httpx

from app.core.config import settings


BASE_URL = "http://127.0.0.1:8000"

TEMP_TOKEN = settings.TEMP_TOKEN
TEMP_REPO_URL = settings.TEMP_REPO_URL

REPORT_FILE = "api_test_report.txt"

results = []


# ============================================================
# TEST HELPER
# ============================================================

async def request(
    client: httpx.AsyncClient,
    method: str,
    endpoint: str,
    expected_status: list[int],
    json: dict | None = None,
):
    headers = {
        "Authorization": f"Bearer {TEMP_TOKEN}"
    }

    start = time.perf_counter()

    try:
        response = await client.request(
            method=method,
            url=f"{BASE_URL}{endpoint}",
            headers=headers,
            json=json,
        )

        duration = time.perf_counter() - start

        try:
            response_data = response.json()
        except Exception:
            response_data = response.text

        passed = response.status_code in expected_status

        results.append({
            "method": method,
            "endpoint": endpoint,
            "status": response.status_code,
            "expected": expected_status,
            "duration": duration,
            "passed": passed,
            "response": response_data,
            "error": None,
        })

        status = "PASS" if passed else "FAIL"

        print(
            f"[{status}] "
            f"{method:<7} "
            f"{endpoint:<65} "
            f"{response.status_code} "
            f"{duration:.3f}s"
        )

        return response

    except Exception as e:

        duration = time.perf_counter() - start

        results.append({
            "method": method,
            "endpoint": endpoint,
            "status": None,
            "expected": expected_status,
            "duration": duration,
            "passed": False,
            "response": None,
            "error": str(e),
        })

        print(
            f"[FAIL] "
            f"{method:<7} "
            f"{endpoint:<65} "
            f"ERROR: {e}"
        )

        return None


# ============================================================
# REPOSITORY
# ============================================================

async def test_repository(
    client: httpx.AsyncClient,
):
    print("\n" + "=" * 80)
    print("REPOSITORY API")
    print("=" * 80)

    repository_id = None

    # --------------------------------------------------------
    # CREATE REPOSITORY
    # --------------------------------------------------------

    response = await request(
        client=client,
        method="POST",
        endpoint="/repositories",
        expected_status=[201, 409],
        json={
            "url": TEMP_REPO_URL,
            "branch": "main",
        },
    )

    if response:

        try:
            body = response.json()

            repository = body.get("data")

            if repository:
                repository_id = repository.get("id")

        except Exception:
            pass

    # --------------------------------------------------------
    # If repository already exists (409),
    # find its ID from GET endpoint is not possible without
    # a list endpoint.
    # --------------------------------------------------------

    if not repository_id:

        print(
            "Repository ID was not returned. "
            "Repository GET/DELETE tests skipped."
        )

        return None

    # --------------------------------------------------------
    # GET REPOSITORY
    # --------------------------------------------------------

    await request(
        client=client,
        method="GET",
        endpoint=f"/repositories/{repository_id}",
        expected_status=[200],
    )

    # --------------------------------------------------------
    # REPOSITORY FILES
    # --------------------------------------------------------

    await test_repository_files(
        client,
        repository_id,
    )

    return repository_id


# ============================================================
# REPOSITORY FILE
# ============================================================

async def test_repository_files(
    client: httpx.AsyncClient,
    repository_id: str,
):
    print("\n" + "=" * 80)
    print("REPOSITORY FILE API")
    print("=" * 80)

    # --------------------------------------------------------
    # GET ALL FILES
    # --------------------------------------------------------

    response = await request(
        client=client,
        method="GET",
        endpoint=f"/repositories/{repository_id}/files",
        expected_status=[200],
    )

    file_id = None

    if response:

        try:
            body = response.json()

            files = body.get("data")

            if files and isinstance(files, list):

                if len(files) > 0:
                    file_id = files[0].get("id")

        except Exception:
            pass

    # --------------------------------------------------------
    # GET FILE BY ID
    # --------------------------------------------------------

    if file_id:

        await request(
            client=client,
            method="GET",
            endpoint=(
                f"/repositories/{repository_id}"
                f"/files/{file_id}"
            ),
            expected_status=[200],
        )

    else:

        print(
            "No repository file found. "
            "File-ID test skipped."
        )

    # --------------------------------------------------------
    # GET FILE BY PATH
    # --------------------------------------------------------

    # Change this path if your test repository has a known file.
    test_file_path = "README.md"

    await request(
        client=client,
        method="GET",
        endpoint=(
            f"/repositories/{repository_id}"
            f"/files/path/{test_file_path}"
        ),
        expected_status=[200, 404],
    )


# ============================================================
# CHAT
# ============================================================

async def test_chat(
    client: httpx.AsyncClient,
    repository_id: str,
):
    print("\n" + "=" * 80)
    print("CHAT API")
    print("=" * 80)

    chat_id = None

    # --------------------------------------------------------
    # CREATE CHAT
    # --------------------------------------------------------

    response = await request(
        client=client,
        method="POST",
        endpoint="/chats",
        expected_status=[201],
        json={
            "name": "API Test Chat",
            "description": "Temporary chat created by API test",
            "repository_id": repository_id,
        },
    )

    if response:

        try:
            body = response.json()

            chat = body.get("data")

            if chat:
                chat_id = chat.get("id")

        except Exception:
            pass

    if not chat_id:

        print(
            "Chat ID was not returned. "
            "Message and delete-chat tests skipped."
        )

        return None

    return chat_id


# ============================================================
# MESSAGE
# ============================================================

async def test_message(
    client: httpx.AsyncClient,
    chat_id: str,
):
    print("\n" + "=" * 80)
    print("MESSAGE API")
    print("=" * 80)

    # --------------------------------------------------------
    # CREATE MESSAGE
    # --------------------------------------------------------

    await request(
        client=client,
        method="POST",
        endpoint=f"/chats/{chat_id}/messages",
        expected_status=[201],
        json={
            "content": "Explain the main purpose of this repository."
        },
    )


# ============================================================
# DELETE CHAT
# ============================================================

async def delete_chat(
    client: httpx.AsyncClient,
    chat_id: str,
):
    print("\n" + "=" * 80)
    print("CHAT DELETE API")
    print("=" * 80)

    await request(
        client=client,
        method="DELETE",
        endpoint=f"/chats/{chat_id}",
        expected_status=[200],
    )


# ============================================================
# DELETE REPOSITORY
# ============================================================

async def delete_repository(
    client: httpx.AsyncClient,
    repository_id: str,
):
    print("\n" + "=" * 80)
    print("REPOSITORY DELETE API")
    print("=" * 80)

    await request(
        client=client,
        method="DELETE",
        endpoint=f"/repositories/{repository_id}",
        expected_status=[200],
    )


# ============================================================
# REPORT
# ============================================================

def generate_report():

    total = len(results)

    passed = sum(
        1
        for result in results
        if result["passed"]
    )

    failed = total - passed

    success_rate = (
        (passed / total) * 100
        if total
        else 0
    )

    lines = []

    lines.append("=" * 80)
    lines.append("RepoChat API TEST REPORT")
    lines.append("=" * 80)

    lines.append(
        f"Generated   : "
        f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    )

    lines.append(
        f"Base URL    : {BASE_URL}"
    )

    lines.append(
        f"Repository  : {TEMP_REPO_URL}"
    )

    lines.append("")

    lines.append("-" * 80)
    lines.append("SUMMARY")
    lines.append("-" * 80)

    lines.append(f"Total Tests : {total}")
    lines.append(f"Passed      : {passed}")
    lines.append(f"Failed      : {failed}")
    lines.append(
        f"Success Rate: {success_rate:.2f}%"
    )

    lines.append("")

    lines.append("-" * 80)
    lines.append("TEST DETAILS")
    lines.append("-" * 80)

    for index, result in enumerate(results, 1):

        status = (
            "PASS"
            if result["passed"]
            else "FAIL"
        )

        lines.append("")
        lines.append(
            f"[{status}] Test #{index}"
        )

        lines.append(
            f"Method      : {result['method']}"
        )

        lines.append(
            f"Endpoint    : {result['endpoint']}"
        )

        lines.append(
            f"Status Code : {result['status']}"
        )

        lines.append(
            f"Expected    : {result['expected']}"
        )

        lines.append(
            f"Duration    : {result['duration']:.3f}s"
        )

        if result["error"]:

            lines.append(
                f"Error       : {result['error']}"
            )

        if result["response"] is not None:

            lines.append(
                f"Response    : {result['response']}"
            )

    lines.append("")
    lines.append("=" * 80)

    report = "\n".join(lines)

    with open(
        REPORT_FILE,
        "w",
        encoding="utf-8",
    ) as file:

        file.write(report)

    print("\n" + "=" * 80)
    print("FINAL RESULT")
    print("=" * 80)

    print(f"Total Tests : {total}")
    print(f"Passed      : {passed}")
    print(f"Failed      : {failed}")
    print(f"Success Rate: {success_rate:.2f}%")

    print("=" * 80)
    print(f"\nReport: {REPORT_FILE}")


# ============================================================
# MAIN
# ============================================================

async def main():

    print("=" * 80)
    print("RepoChat API TEST")
    print("=" * 80)

    print(f"Base URL : {BASE_URL}")
    print(f"Repo URL : {TEMP_REPO_URL}")
    print()

    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
    ) as client:

        # 1. Repository
        repository_id = await test_repository(
            client
        )

        if not repository_id:

            generate_report()
            return

        # 2. Chat
        chat_id = await test_chat(
            client,
            repository_id,
        )

        if chat_id:

            # 3. Message
            await test_message(
                client,
                chat_id,
            )

            # 4. Delete Chat
            await delete_chat(
                client,
                chat_id,
            )

        # 5. Delete Repository
        await delete_repository(
            client,
            repository_id,
        )

    # Generate report
    generate_report()


if __name__ == "__main__":
    asyncio.run(main())