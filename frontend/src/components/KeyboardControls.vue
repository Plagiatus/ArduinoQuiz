<template>
    <div id="keyboardControls">
        Keyboard Controls
        <table>
            <tbody>
                <tr>
                    <th colspan="2">
                        General
                    </th>
                </tr>
                <tr>
                    <td><code>Ctrl+&lt;num&gt;</code></td>
                    <td>Set player amount</td>
                </tr>
                <tr>
                    <th colspan="2">
                        Family Feud
                    </th>
                </tr>
                <tr>
                    <td><code>Alt+&lt;num&gt;</code></td>
                    <td>Reveal that answer</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style>
#keyboardControls {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 1em;
}

td {
    text-align: left;
}
</style>