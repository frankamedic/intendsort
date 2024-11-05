// ==UserScript==
// @name         Goal Intention Sorter
// @namespace    http://intend.do/
// @version      1.0
// @description  Adds a sort button to organize goal intentions numerically
// @grant        none
// @match        https://intend.do/*
// @author       frankamedic
// ==/UserScript==


(function() {
    'use strict';

    function addSortButton(textArea) {
        // Check if button already exists
        if (document.querySelector('.goal-sort-button')) {
            return;
        }

        // Create button group span
        const btnGroup = document.createElement('span');
        btnGroup.className = 'btn-group btn-with-margin';

        // Create the sort button
        const button = document.createElement('button');
        button.className = 'btn btn-xs btn-default btn-border btn-border-info goal-sort-button';
        button.title = 'Sort intentions by goal number';

        // Create icon span
        const icon = document.createElement('span');
        icon.className = 'glyphicon glyphicon-sort-by-order icon-info';

        // Add icon and text to button
        button.appendChild(icon);
        button.appendChild(document.createTextNode(' Sort Goals'));

        // Add button to button group
        btnGroup.appendChild(button);

        // Find the intention-source-holder
        const sourceHolder = document.querySelector('.intention-source-holder');
        if (sourceHolder) {
            // Insert at the beginning of the source holder
            sourceHolder.insertBefore(btnGroup, sourceHolder.firstChild);
        }

        button.addEventListener('click', () => {
            sortGoals(textArea);
        });
    }

    function sortGoals(textArea) {
        // Get the current value
        let text = textArea.value;
        let lines = text.split('\n');

        // Filter out empty lines but preserve their positions
        let nonEmptyLines = lines.filter(line => line.trim() !== '');

        // Sort non-empty lines
        nonEmptyLines.sort((a, b) => {
            // Improved number extraction
            let numA = a.match(/^(\d+)\)/);
            let numB = b.match(/^(\d+)\)/);

            // Convert to numbers, default to 0 if no match
            numA = numA ? parseInt(numA[1]) : 0;
            numB = numB ? parseInt(numB[1]) : 0;

            return numA - numB;
        });

        // Set the new value
        textArea.value = nonEmptyLines.join('\n');

        // Trigger changes for Angular
        textArea.dispatchEvent(new Event('input', { bubbles: true }));
        textArea.dispatchEvent(new Event('change', { bubbles: true }));
        textArea.dispatchEvent(new Event('blur'));

        // Try to find and update the Angular model
        const scope = angular.element(textArea).scope();
        if (scope) {
            scope.$apply(function() {
                scope.localIntentions = textArea.value;
            });
        }
    }

    function initialize() {
        const textArea = document.getElementById('box_todosCurrentday');
        if (textArea) {
            addSortButton(textArea);
        }
    }

    // Create a MutationObserver to watch for the textarea
    const observer = new MutationObserver((mutations, obs) => {
        const textArea = document.getElementById('box_todosCurrentday');
        if (textArea) {
            addSortButton(textArea);
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });

    // Initial check
    initialize();
})();
