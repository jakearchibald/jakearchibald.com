/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Check that a node module exists, and treat it as external.
export default function () {
  return {
    name: 'node-external',
    async resolveId(id, importer, { custom }) {
      if (
        id.startsWith('.') ||
        id.startsWith('/') ||
        custom['node-external']?.skip
      ) {
        return;
      }

      try {
        await import.meta.resolve(id);
        return { id, external: true };
      } catch (err) {}
    },
  };
}
